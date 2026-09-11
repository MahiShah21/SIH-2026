import { query, memoryStore } from '../config/db.js';
import { evaluateVeracity } from '../services/aiClassifierService.js';
import { getIO, broadcastNotification } from '../socket/socketHandler.js';

/**
 * GET /api/problems
 * List citizen problems with filters
 */
export async function getProblems(req, res, next) {
  try {
    const { district, category, status, citizen_id } = req.query;
    let problems = [];

    try {
      let sql = 'SELECT * FROM problems WHERE 1=1';
      const params = [];

      if (citizen_id && citizen_id !== 'all') {
        params.push(citizen_id);
        sql += ` AND citizen_id = $${params.length}`;
      }
      if (district && district !== 'all') {
        params.push(district);
        sql += ` AND LOWER(district) = LOWER($${params.length})`;
      }
      if (category && category !== 'all') {
        params.push(category);
        sql += ` AND category = $${params.length}`;
      }
      if (status && status !== 'all') {
        params.push(status);
        sql += ` AND status = $${params.length}`;
      }

      sql += ' ORDER BY created_at DESC';
      const result = await query(sql, params);
      problems = result.rows;
    } catch (e) {
      problems = [...memoryStore.problems];
      if (citizen_id && citizen_id !== 'all') {
        problems = problems.filter(p => p.citizen_id === citizen_id);
      }
      if (district && district !== 'all') {
        problems = problems.filter(p => p.district.toLowerCase() === district.toLowerCase());
      }
      if (category && category !== 'all') {
        problems = problems.filter(p => p.category === category);
      }
    }

    return res.status(200).json({
      success: true,
      count: problems.length,
      problems
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/problems/:id
 */
export async function getProblemById(req, res, next) {
  try {
    const { id } = req.params;
    let problem = null;

    try {
      const resDb = await query('SELECT * FROM problems WHERE id = $1', [id]);
      if (resDb.rows.length > 0) problem = resDb.rows[0];
    } catch (e) {
      problem = memoryStore.problems.find(p => p.id === id);
    }

    if (!problem) {
      return res.status(404).json({ success: false, message: `Problem ${id} not found.` });
    }

    return res.status(200).json({ success: true, problem });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/problems
 * Submit new grievance with automatic AI classification and veracity scoring
 */
export async function createProblem(req, res, next) {
  try {
    const {
      title,
      description,
      category: inputCategory,
      district = 'Gumla',
      block = 'Dumri Block',
      village = 'Majhgaon Tola',
      latitude = '23.0428° N',
      longitude = '84.5421° E',
      priority = 'high',
      urgency = false,
      evidenceFiles = []
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.'
      });
    }

    // 1. Run AI Veracity & Category Evaluation
    const aiAnalysis = evaluateVeracity({
      title,
      description,
      district,
      block,
      village,
      latitude,
      longitude,
      evidenceFiles
    });

    const assignedCategory = inputCategory || aiAnalysis.classification.recommendedCategory;
    const newId = `JH-${Math.floor(1000 + Math.random() * 9000)}`;
    const citizenId = req.body.citizen_id || req.body.citizenId || req.user?.id || 'usr_citizen_01';

    const newProblem = {
      id: newId,
      citizen_id: citizenId,
      title,
      description,
      category: assignedCategory,
      district,
      block,
      village,
      latitude,
      longitude,
      priority,
      status: aiAnalysis.isReal ? 'AI_VERIFIED' : 'SUBMITTED',
      urgency: Boolean(urgency),
      is_real: aiAnalysis.isReal,
      veracity_score: aiAnalysis.veracityScore,
      ai_category: aiAnalysis.classification.recommendedCategory,
      ai_confidence: aiAnalysis.classification.confidence,
      ai_rationale: aiAnalysis.rationale,
      authenticity_flags: aiAnalysis.flags,
      evidence_files: evidenceFiles,
      upvotes_count: 1,
      created_at: new Date().toISOString()
    };

    // 2. Persist to Neon PostgreSQL or Memory Store
    try {
      await query(
        `INSERT INTO problems (id, citizen_id, title, description, category, district, block, village, latitude, longitude, priority, status, urgency, is_real, veracity_score, ai_category, ai_confidence, ai_rationale, authenticity_flags, evidence_files, upvotes_count, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, CURRENT_TIMESTAMP)`,
        [
          newProblem.id,
          newProblem.citizen_id,
          newProblem.title,
          newProblem.description,
          newProblem.category,
          newProblem.district,
          newProblem.block,
          newProblem.village,
          newProblem.latitude,
          newProblem.longitude,
          newProblem.priority,
          newProblem.status,
          newProblem.urgency,
          newProblem.is_real,
          newProblem.veracity_score,
          newProblem.ai_category,
          newProblem.ai_confidence,
          newProblem.ai_rationale,
          JSON.stringify(newProblem.authenticity_flags),
          JSON.stringify(newProblem.evidence_files),
          newProblem.upvotes_count
        ]
      );
    } catch (e) {
      memoryStore.problems.unshift(newProblem);
    }

    // 3. Emit real-time Socket.io event & cross-dashboard notifications
    try {
      const io = getIO();
      if (io) {
        io.emit('problem_created', newProblem);
      }
      // Broadcast real-time alert to Government Officers & Academic Researchers
      broadcastNotification('admin', {
        id: `notif-${Date.now()}-adm`,
        recipient_role: 'admin',
        title: 'New Citizen Grievance Submitted',
        message: `[${newProblem.id}] "${newProblem.title}" in ${newProblem.district} (AI Veracity: ${newProblem.veracity_score}%)`,
        type: 'PROBLEM',
        reference_id: newProblem.id,
        is_read: false,
        created_at: new Date().toISOString()
      });
      broadcastNotification('university', {
        id: `notif-${Date.now()}-uni`,
        recipient_role: 'university',
        title: `New Civic Challenge: ${newProblem.category}`,
        message: `"${newProblem.title}" in ${newProblem.district} available for university research & prototype proposal.`,
        type: 'PROBLEM',
        reference_id: newProblem.id,
        is_read: false,
        created_at: new Date().toISOString()
      });
    } catch (sockErr) {
      console.warn('⚠️ [Socket.io] Problem broadcast fallback:', sockErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Grievance submitted and analyzed by JanSetu AI pipeline.',
      problem: newProblem,
      aiAnalysis
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/problems/:id/upvote
 */
export async function upvoteProblem(req, res, next) {
  try {
    const { id } = req.params;
    let upvotes = 1;

    try {
      const dbRes = await query(
        'UPDATE problems SET upvotes_count = upvotes_count + 1 WHERE id = $1 RETURNING upvotes_count',
        [id]
      );
      if (dbRes.rows.length > 0) upvotes = dbRes.rows[0].upvotes_count;
    } catch (e) {
      const p = memoryStore.problems.find(item => item.id === id);
      if (p) {
        p.upvotes_count = (p.upvotes_count || 0) + 1;
        upvotes = p.upvotes_count;
      }
    }

    return res.status(200).json({ success: true, upvotes });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/problems/:id/status
 */
export async function updateProblemStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    let updated = null;

    try {
      const dbRes = await query(
        'UPDATE problems SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );
      if (dbRes.rows.length > 0) updated = dbRes.rows[0];
    } catch (e) {
      const p = memoryStore.problems.find(item => item.id === id);
      if (p) {
        p.status = status;
        if (remarks) p.remarks = remarks;
        updated = p;
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: `Problem ${id} not found.` });
    }

    // Emit real-time Socket.io status update
    try {
      const io = getIO();
      if (io) {
        io.emit('problem_updated', updated);
      }
      broadcastNotification('citizen', {
        id: `notif-${Date.now()}-cit`,
        recipient_role: 'citizen',
        title: `Grievance Status: ${status}`,
        message: `Your grievance ${id} ("${updated.title}") has been marked as ${status}.`,
        type: 'PROBLEM',
        reference_id: id,
        is_read: false,
        created_at: new Date().toISOString()
      });
      broadcastNotification('admin', {
        id: `notif-${Date.now()}-adm`,
        recipient_role: 'admin',
        title: `Problem ${id} Action Recorded`,
        message: `Status updated to ${status}.`,
        type: 'PROBLEM',
        reference_id: id,
        is_read: false,
        created_at: new Date().toISOString()
      });
    } catch (sockErr) {
      console.warn('⚠️ [Socket.io] Problem status update broadcast fallback:', sockErr.message);
    }

    return res.status(200).json({ success: true, problem: updated });
  } catch (err) {
    next(err);
  }
}

