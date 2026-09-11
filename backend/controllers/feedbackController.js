import { query, memoryStore } from '../config/db.js';
import { getIO, broadcastNotification } from '../socket/socketHandler.js';

/**
 * GET /api/feedback
 * Fetch all citizen feedbacks
 */
export async function getFeedbacks(req, res, next) {
  try {
    const { project_id, problem_id } = req.query;
    let feedbacks = [];
    try {
      let sql = 'SELECT * FROM feedback WHERE 1=1';
      const params = [];
      if (project_id) {
        params.push(project_id);
        sql += ` AND project_id = $${params.length}`;
      }
      if (problem_id) {
        params.push(problem_id);
        sql += ` AND problem_id = $${params.length}`;
      }
      sql += ' ORDER BY created_at DESC';
      const resDb = await query(sql, params);
      feedbacks = resDb.rows;
    } catch (e) {
      feedbacks = [...memoryStore.feedback];
      if (project_id) {
        feedbacks = feedbacks.filter(fb => fb.project_id === project_id);
      }
      if (problem_id) {
        feedbacks = feedbacks.filter(fb => fb.problem_id === problem_id);
      }
    }

    return res.status(200).json({ success: true, count: feedbacks.length, feedbacks });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/feedback
 * Submit citizen verification feedback for a problem / project
 */
export async function submitFeedback(req, res, next) {
  try {
    const {
      problem_id = 'JH-C1042',
      project_id = 'PRJ-315',
      citizen_id = 'usr_citizen_01',
      solution_status = 'completely',
      rating = 5,
      notes = 'Ground verification confirmed.',
      beneficiaries_reached = 500,
      attachments = []
    } = req.body;

    const newFeedback = {
      id: `fb-${Date.now()}`,
      problem_id,
      project_id,
      citizen_id,
      solution_status,
      rating: Number(rating) || 5,
      notes,
      beneficiaries_reached: Number(beneficiaries_reached) || 500,
      attachments,
      created_at: new Date().toISOString()
    };

    try {
      await query(
        `INSERT INTO feedback (id, problem_id, project_id, citizen_id, solution_status, rating, notes, beneficiaries_reached, attachments)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newFeedback.id, newFeedback.problem_id, newFeedback.project_id, newFeedback.citizen_id, newFeedback.solution_status, newFeedback.rating, newFeedback.notes, newFeedback.beneficiaries_reached, JSON.stringify(newFeedback.attachments)]
      );
    } catch (e) {
      memoryStore.feedback.unshift(newFeedback);
    }

    // Emit real-time Socket.io feedback event & cross-dashboard notification
    try {
      const io = getIO();
      if (io) {
        io.emit('feedback_submitted', newFeedback);
      }
      broadcastNotification('university', {
        id: `notif-${Date.now()}-u-fb`,
        recipient_role: 'university',
        title: 'New Citizen Ground Verification',
        message: `Citizen verified project ${newFeedback.project_id} with rating ${newFeedback.rating}/5 (${newFeedback.solution_status})!`,
        type: 'FEEDBACK',
        reference_id: newFeedback.project_id,
        is_read: false,
        created_at: new Date().toISOString()
      });
      broadcastNotification('industry', {
        id: `notif-${Date.now()}-i-fb`,
        recipient_role: 'industry',
        title: 'Citizen Impact Verification',
        message: `Ground deployment confirmed for ${newFeedback.project_id}. ${newFeedback.beneficiaries_reached} beneficiaries reached.`,
        type: 'FEEDBACK',
        reference_id: newFeedback.project_id,
        is_read: false,
        created_at: new Date().toISOString()
      });
    } catch (sockErr) {
      console.warn('⚠️ [Socket.io] Feedback broadcast fallback:', sockErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Citizen feedback and on-ground verification logged successfully.',
      feedback: newFeedback
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/feedback/impact-stats
 * Calculate live dynamic metrics for Impacts and Citations page based on feedback form information
 */
export async function getImpactStats(req, res, next) {
  try {
    let feedbacks = [];
    let projects = [];

    try {
      const fbRes = await query('SELECT * FROM feedback');
      feedbacks = fbRes.rows;
      const prjRes = await query('SELECT * FROM projects');
      projects = prjRes.rows;
    } catch (e) {
      feedbacks = [...memoryStore.feedback];
      projects = [...memoryStore.projects];
    }

    // Projects impacted = unique project IDs in feedback + active projects
    const feedbackProjectIds = new Set(feedbacks.map(f => f.project_id).filter(Boolean));
    const projectsImpacted = feedbackProjectIds.size > 0 ? feedbackProjectIds.size : feedbacks.length;

    // Total beneficiaries reached = sum of beneficiaries in feedbacks
    const totalBeneficiaries = feedbacks.reduce((acc, curr) => acc + (Number(curr.beneficiaries_reached) || 0), 0);

    // Institutions engaged = distinct lead institutions
    const institutionsSet = new Set(projects.map(p => p.lead_institution).filter(Boolean));
    const institutionsEngaged = institutionsSet.size > 0 ? institutionsSet.size : 1;

    // Impact score = weighted percentage based on feedback ratings (out of 5 -> 100%)
    const avgRating = feedbacks.length > 0 
      ? feedbacks.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0) / feedbacks.length 
      : 4.3;
    const impactScorePercent = Math.min(100, Math.round((avgRating / 5) * 100));

    return res.status(200).json({
      success: true,
      stats: {
        projectsImpacted,
        totalBeneficiaries,
        institutionsEngaged,
        impactScorePercent,
        feedbacksCount: feedbacks.length
      },
      feedbacks
    });
  } catch (err) {
    next(err);
  }
}
