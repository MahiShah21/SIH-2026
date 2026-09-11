import { query, memoryStore } from '../config/db.js';
import { getIO, broadcastNotification } from '../socket/socketHandler.js';

/**
 * POST /api/projects
 * Accept a challenge / create a university active project
 */
export async function createProject(req, res, next) {
  try {
    const {
      id,
      title,
      challenge_id,
      problem_id,
      lead_institution = 'BIT Mesra, Ranchi',
      lead_faculty = 'Dr. A. K. Sharma',
      lead_mentor_dept = 'Dept of CSE & AI',
      lab_location = 'IoT & Civic Innovation Lab',
      department = 'Civic Systems Engineering',
      domain = 'Civic Infrastructure',
      location = 'Ranchi, Jharkhand',
      description = '',
      status = 'IN_PROGRESS',
      stage = 'Proposal',
      next_stage = 'Prototype',
      phase = 'Solution Formulation Phase',
      progress_percent = 15,
      total_budget = '₹5,00,000',
      disbursed_amount = '₹1,50,000',
      sanctioned_grant = '₹5,00,000',
      industry_partner = 'TechNova Solutions / CSR Pool',
      is_accepted_by_university = true
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    const linkedChallengeId = challenge_id || problem_id || null;
    const cleanId = id || `PRJ-${linkedChallengeId ? linkedChallengeId.replace(/[^a-zA-Z0-9]/g, '') : 'RND'}-${Date.now().toString().slice(-4)}`;

    const newProject = {
      id: cleanId,
      title,
      challenge_id: linkedChallengeId,
      lead_institution,
      lead_faculty,
      lead_mentor_dept,
      lab_location,
      department,
      domain,
      location,
      description,
      status,
      status_label: 'Accepted by University',
      stage,
      next_stage,
      phase,
      progress_percent: Number(progress_percent) || 15,
      total_budget,
      disbursed_amount,
      sanctioned_grant,
      industry_partner,
      is_accepted_by_university: Boolean(is_accepted_by_university),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Insert or update in database
    try {
      if (linkedChallengeId) {
        try {
          await query(
            `INSERT INTO challenges (id, problem_id, title, domain, district, priority, status)
             VALUES ($1, $1, $2, $3, $4, 'high', 'ACCEPTED')
             ON CONFLICT (id) DO UPDATE SET status = 'ACCEPTED'`,
            [linkedChallengeId, title, domain || department, location || 'Jharkhand']
          );
        } catch (chErr) {
          // Non-blocking challenge sync
        }
      }

      await query(
        `INSERT INTO projects (
          id, title, challenge_id, lead_institution, lead_faculty, lead_mentor_dept, 
          lab_location, department, domain, location, description, status, status_label, 
          stage, next_stage, phase, progress_percent, total_budget, disbursed_amount, 
          sanctioned_grant, industry_partner, is_accepted_by_university, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET 
          status = EXCLUDED.status, 
          stage = EXCLUDED.stage, 
          is_accepted_by_university = true, 
          updated_at = CURRENT_TIMESTAMP`,
        [
          newProject.id, newProject.title, newProject.challenge_id, newProject.lead_institution, 
          newProject.lead_faculty, newProject.lead_mentor_dept, newProject.lab_location, 
          newProject.department, newProject.domain, newProject.location, newProject.description, 
          newProject.status, newProject.status_label, newProject.stage, newProject.next_stage, 
          newProject.phase, newProject.progress_percent, newProject.total_budget, 
          newProject.disbursed_amount, newProject.sanctioned_grant, newProject.industry_partner, 
          newProject.is_accepted_by_university
        ]
      );

      // If linked to a problem, update problem status to 'ACCEPTED'
      if (linkedChallengeId) {
        await query(
          `UPDATE problems SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [linkedChallengeId]
        );
        await query(
          `UPDATE challenges SET status = 'ACCEPTED' WHERE id = $1 OR problem_id = $1`,
          [linkedChallengeId]
        );
      }
    } catch (e) {
      console.warn('DB project insert fallback to memoryStore:', e.message);
      const existingIdx = memoryStore.projects.findIndex(p => p.id === newProject.id);
      if (existingIdx >= 0) {
        memoryStore.projects[existingIdx] = { ...memoryStore.projects[existingIdx], ...newProject };
      } else {
        memoryStore.projects.unshift(newProject);
      }

      if (linkedChallengeId) {
        const prob = memoryStore.problems.find(p => p.id === linkedChallengeId);
        if (prob) prob.status = 'ACCEPTED';
        const ch = memoryStore.challenges.find(c => c.id === linkedChallengeId || c.problem_id === linkedChallengeId);
        if (ch) ch.status = 'ACCEPTED';
      }
    }

    // 2. Broadcast Socket.IO event and cross-dashboard notifications
    try {
      const io = getIO();
      if (io) {
        io.emit('project_created', newProject);
        io.emit('problem_updated', { id: linkedChallengeId, status: 'ACCEPTED' });
      }

      broadcastNotification('university', {
        id: `notif-${Date.now()}-uni-acc`,
        recipient_role: 'university',
        title: 'Challenge Accepted by University',
        message: `Project ${newProject.id} ("${newProject.title}") is now active in University R&D Hub.`,
        type: 'PROJECT',
        reference_id: newProject.id,
        is_read: false,
        created_at: new Date().toISOString()
      });

      broadcastNotification('citizen', {
        id: `notif-${Date.now()}-cit-acc`,
        recipient_role: 'citizen',
        title: 'Problem Statement Accepted by University',
        message: `Great news! "${newProject.title}" has been accepted by ${newProject.lead_institution} for research & solution prototyping.`,
        type: 'PROBLEM',
        reference_id: linkedChallengeId || newProject.id,
        is_read: false,
        created_at: new Date().toISOString()
      });

      broadcastNotification('admin', {
        id: `notif-${Date.now()}-adm-acc`,
        recipient_role: 'admin',
        title: 'University Accepted R&D Project',
        message: `${newProject.lead_institution} accepted "${newProject.title}" (${newProject.id}).`,
        type: 'PROJECT',
        reference_id: newProject.id,
        is_read: false,
        created_at: new Date().toISOString()
      });
    } catch (sockErr) {
      console.warn('Socket broadcast warning:', sockErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Challenge accepted and active project created successfully.',
      project: newProject
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects
 * List all projects, with optional filter for accepted university projects
 */
export async function getProjects(req, res, next) {
  try {
    const { accepted_only, is_accepted_by_university, accepted, status } = req.query;
    const isAcceptedFilter = accepted_only === 'true' || is_accepted_by_university === 'true' || accepted === 'true';
    let projects = [];
    try {
      let sql = 'SELECT * FROM projects WHERE 1=1';
      const params = [];
      if (isAcceptedFilter) {
        params.push(true);
        sql += ` AND is_accepted_by_university = $${params.length}`;
      }
      if (status && status !== 'all') {
        params.push(status);
        sql += ` AND status = $${params.length}`;
      }
      sql += ' ORDER BY created_at DESC';
      const resDb = await query(sql, params);
      projects = resDb.rows;
    } catch (e) {
      projects = [...memoryStore.projects];
      if (isAcceptedFilter) {
        projects = projects.filter(p => p.is_accepted_by_university !== false);
      }
      if (status && status !== 'all') {
        projects = projects.filter(p => p.status === status);
      }
    }

    return res.status(200).json({ success: true, count: projects.length, projects });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects/:id
 * Fetch complete project details with documents, teams, proposals, and feedbacks
 */
export async function getProjectById(req, res, next) {
  try {
    const { id } = req.params;
    let project = null;
    let documents = [];
    let teams = [];
    let proposals = [];
    let feedbacks = [];

    try {
      const pRes = await query('SELECT * FROM projects WHERE id = $1', [id]);
      if (pRes.rows.length > 0) project = pRes.rows[0];

      const dRes = await query('SELECT * FROM project_documents WHERE project_id = $1 ORDER BY created_at DESC', [id]);
      documents = dRes.rows;

      const tRes = await query('SELECT * FROM project_teams WHERE project_id = $1', [id]);
      teams = tRes.rows;

      const propRes = await query('SELECT * FROM proposals WHERE project_id = $1 OR challenge_id = $2', [id, project?.challenge_id || '']);
      proposals = propRes.rows;

      const fbRes = await query('SELECT * FROM feedback WHERE project_id = $1 ORDER BY created_at DESC', [id]);
      feedbacks = fbRes.rows;
    } catch (e) {
      project = memoryStore.projects.find(p => p.id === id);
      documents = memoryStore.project_documents.filter(d => d.project_id === id);
      teams = memoryStore.project_teams.filter(t => t.project_id === id);
      proposals = memoryStore.proposals.filter(pr => pr.project_id === id);
      feedbacks = memoryStore.feedback.filter(fb => fb.project_id === id);
    }

    if (!project) {
      return res.status(404).json({ success: false, message: `Project ${id} not found.` });
    }

    return res.status(200).json({
      success: true,
      project: {
        ...project,
        documents,
        teams,
        proposals,
        feedbacks
      },
      documents,
      teams,
      proposals,
      feedbacks
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/projects/:id/lifecycle
 * Update project lifecycle stage, next stage, progress percentage, and status
 */
export async function updateProjectLifecycle(req, res, next) {
  try {
    const { id } = req.params;
    const { stage, nextStage, progressPercent, status, phase } = req.body;

    const updatedFields = {
      stage: stage || 'Prototype',
      next_stage: nextStage || 'Testing',
      progress_percent: progressPercent !== undefined ? Number(progressPercent) : 50,
      status: status || 'IN_PROGRESS',
      phase: phase || 'Development Phase'
    };

    try {
      await query(
        `UPDATE projects 
         SET stage = $1, next_stage = $2, progress_percent = $3, status = $4, phase = $5, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $6`,
        [updatedFields.stage, updatedFields.next_stage, updatedFields.progress_percent, updatedFields.status, updatedFields.phase, id]
      );
    } catch (e) {
      const idx = memoryStore.projects.findIndex(p => p.id === id);
      if (idx !== -1) {
        memoryStore.projects[idx] = { ...memoryStore.projects[idx], ...updatedFields };
      }
    }

    return res.status(200).json({
      success: true,
      message: `Project ${id} lifecycle updated successfully.`,
      lifecycle: updatedFields
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/projects/:id/budget
 * Update project Total Budget required, disbursed amount, and sanctioned grants
 */
export async function updateProjectBudget(req, res, next) {
  try {
    const { id } = req.params;
    const { totalBudget, disbursedAmount, sanctionedGrant } = req.body;

    const updatedBudget = {
      total_budget: totalBudget || '₹5,00,000',
      disbursed_amount: disbursedAmount || '₹2,50,000',
      sanctioned_grant: sanctionedGrant || totalBudget || '₹5,00,000'
    };

    try {
      await query(
        `UPDATE projects 
         SET total_budget = $1, disbursed_amount = $2, sanctioned_grant = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4`,
        [updatedBudget.total_budget, updatedBudget.disbursed_amount, updatedBudget.sanctioned_grant, id]
      );
    } catch (e) {
      const idx = memoryStore.projects.findIndex(p => p.id === id);
      if (idx !== -1) {
        memoryStore.projects[idx] = { ...memoryStore.projects[idx], ...updatedBudget };
      }
    }

    return res.status(200).json({
      success: true,
      message: `Total budget for project ${id} successfully updated and stored in database.`,
      budget: updatedBudget
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/projects/:id/documents
 * Upload document to project vault
 */
export async function addProjectDocument(req, res, next) {
  try {
    const { id: projectId } = req.params;
    const { 
      title, 
      name,
      category = 'Technical Documents', 
      file_url = 'https://jharinnovate.gov.in/docs/sample.pdf', 
      file_size = '2.4 MB',
      format = 'PDF',
      status = 'Verified'
    } = req.body;
    const uploaded_by = req.user?.name || req.body.uploaded_by || 'Dr. A. K. Sharma';

    const newDoc = {
      id: `doc-${Date.now()}`,
      project_id: projectId,
      title: title || name || 'New_Project_Document.pdf',
      name: title || name || 'New_Project_Document.pdf',
      category,
      file_url,
      file_size,
      format,
      status,
      uploaded_by,
      created_at: new Date().toISOString()
    };

    try {
      await query(
        `INSERT INTO project_documents (id, project_id, title, category, file_url, file_size, format, status, uploaded_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newDoc.id, newDoc.project_id, newDoc.title, newDoc.category, newDoc.file_url, newDoc.file_size, newDoc.format, newDoc.status, newDoc.uploaded_by]
      );
    } catch (e) {
      memoryStore.project_documents.unshift(newDoc);
    }

    return res.status(201).json({ success: true, message: 'Document added to Project Vault.', document: newDoc });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/projects/:id/teams
 * Assign new researcher or faculty member to project team
 */
export async function addTeamMember(req, res, next) {
  try {
    const { id: projectId } = req.params;
    const { 
      member_name, 
      name,
      role_title = 'Research Fellow', 
      department = 'Department of CS & AI',
      email = 'researcher@bitmesra.ac.in',
      status = 'Research Scholar',
      avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    } = req.body;

    const newMember = {
      id: `tm-${Date.now()}`,
      project_id: projectId,
      user_id: null,
      member_name: member_name || name || 'New Research Scholar',
      name: member_name || name || 'New Research Scholar',
      role_title,
      department,
      email,
      status,
      avatar_url,
      created_at: new Date().toISOString()
    };

    try {
      await query(
        `INSERT INTO project_teams (id, project_id, user_id, member_name, role_title, department, email, status, avatar_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newMember.id, newMember.project_id, newMember.user_id, newMember.member_name, newMember.role_title, newMember.department, newMember.email, newMember.status, newMember.avatar_url]
      );
    } catch (e) {
      memoryStore.project_teams.push(newMember);
    }

    return res.status(201).json({ success: true, message: 'Team member assigned to project.', member: newMember });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/projects/:id/proposals
 * Add or update proposal state grant and tranches for project
 */
export async function updateProposalGrant(req, res, next) {
  try {
    const { id: projectId } = req.params;
    const { 
      title, 
      grantCode, 
      sanctionedBy, 
      csrMatchPartner, 
      csrContribution, 
      govtContribution, 
      grantAmount, 
      utilizationPercentage, 
      tranches 
    } = req.body;

    const proposalData = {
      id: `prop-${projectId.replace('PRJ-', '')}`,
      project_id: projectId,
      university_name: 'BIT Mesra, Ranchi',
      title: title || 'State Innovation Grant Proposal',
      grant_code: grantCode || `JH-RND-2026-${projectId.replace('PRJ-', '')}`,
      sanctioned_by: sanctionedBy || 'Directorate of Higher & Technical Education',
      csr_match_partner: csrMatchPartner || 'Corporate CSR Innovation Pool',
      csr_contribution: csrContribution || '₹2,50,000 (55%)',
      govt_contribution: govtContribution || '₹2,00,000 (45%)',
      grant_amount: grantAmount || '₹4,50,000',
      utilization_percentage: utilizationPercentage || 50,
      tranches: tranches || []
    };

    try {
      await query(
        `INSERT INTO proposals (id, project_id, university_name, title, grant_code, sanctioned_by, csr_match_partner, csr_contribution, govt_contribution, grant_amount, utilization_percentage, tranches)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE 
         SET grant_code = EXCLUDED.grant_code, sanctioned_by = EXCLUDED.sanctioned_by, csr_match_partner = EXCLUDED.csr_match_partner, csr_contribution = EXCLUDED.csr_contribution, govt_contribution = EXCLUDED.govt_contribution, grant_amount = EXCLUDED.grant_amount, utilization_percentage = EXCLUDED.utilization_percentage, tranches = EXCLUDED.tranches`,
        [proposalData.id, proposalData.project_id, proposalData.university_name, proposalData.title, proposalData.grant_code, proposalData.sanctioned_by, proposalData.csr_match_partner, proposalData.csr_contribution, proposalData.govt_contribution, proposalData.grant_amount, proposalData.utilization_percentage, JSON.stringify(proposalData.tranches)]
      );
    } catch (e) {
      const idx = memoryStore.proposals.findIndex(pr => pr.project_id === projectId || pr.id === proposalData.id);
      if (idx !== -1) {
        memoryStore.proposals[idx] = { ...memoryStore.proposals[idx], ...proposalData };
      } else {
        memoryStore.proposals.push(proposalData);
      }
    }

    return res.status(200).json({ success: true, message: 'Proposal grant state updated.', proposal: proposalData });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects/challenges
 */
export async function getChallenges(req, res, next) {
  try {
    let challenges = [];
    try {
      const resDb = await query('SELECT * FROM challenges ORDER BY created_at DESC');
      challenges = resDb.rows;
    } catch (e) {
      challenges = [...memoryStore.challenges];
    }

    return res.status(200).json({ success: true, count: challenges.length, challenges });
  } catch (err) {
    next(err);
  }
}
