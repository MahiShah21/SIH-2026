import { query, memoryStore } from '../config/db.js';
import { broadcastNotification, broadcastCollaboration } from '../socket/socketHandler.js';

/**
 * GET /api/collaborations
 * Fetch all university-industry collaborations
 */
export async function getCollaborations(req, res, next) {
  try {
    const { project_id, status } = req.query;
    let collaborations = [];

    try {
      let sql = 'SELECT * FROM collaborations WHERE 1=1';
      const params = [];
      if (project_id) {
        params.push(project_id);
        sql += ` AND project_id = $${params.length}`;
      }
      if (status && status !== 'all') {
        params.push(status);
        sql += ` AND status = $${params.length}`;
      }
      sql += ' ORDER BY created_at DESC';
      const resDb = await query(sql, params);
      collaborations = resDb.rows;
    } catch (e) {
      collaborations = [...memoryStore.collaborations];
      if (project_id) {
        collaborations = collaborations.filter(c => c.project_id === project_id);
      }
      if (status && status !== 'all') {
        collaborations = collaborations.filter(c => c.status === status);
      }
    }

    return res.status(200).json({
      success: true,
      count: collaborations.length,
      collaborations
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/collaborations
 * Initiate collaboration between University and Industry with automatic cross-notification
 */
export async function createCollaboration(req, res, next) {
  try {
    const {
      project_id = 'PRJ-315',
      company_name = 'TechNova Systems',
      partner_type = 'CSR & Hardware Partner',
      committed_amount = '₹2,50,000',
      details = 'Collaborative R&D for hardware prototyping and telemetry validation.',
      mou_status = 'Pending Review',
      status = 'PENDING',
      initiated_by = 'university' // 'university' or 'industry'
    } = req.body;

    const newCollab = {
      id: `collab-${Date.now()}`,
      project_id,
      company_name,
      partner_type,
      committed_amount,
      details,
      mou_status,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      await query(
        `INSERT INTO collaborations (id, project_id, company_name, partner_type, committed_amount, details, mou_status, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [newCollab.id, newCollab.project_id, newCollab.company_name, newCollab.partner_type, newCollab.committed_amount, newCollab.details, newCollab.mou_status, newCollab.status, newCollab.created_at, newCollab.updated_at]
      );
    } catch (e) {
      memoryStore.collaborations.unshift(newCollab);
    }

    // Determine reciprocal recipient role for automatic notification
    const recipientRole = initiated_by === 'university' ? 'industry' : 'university';
    const notifTitle = initiated_by === 'university'
      ? `New R&D Collaboration Request for ${project_id}`
      : `New Industry CSR Partnership Offer from ${company_name}`;
    const notifMessage = initiated_by === 'university'
      ? `University research team requested collaboration with ${company_name} for ${committed_amount} grant pool.`
      : `${company_name} initiated partnership with committed CSR fund of ${committed_amount}.`;

    const autoNotif = {
      id: `notif-${Date.now()}`,
      recipient_role: recipientRole,
      title: notifTitle,
      message: notifMessage,
      type: 'COLLABORATION',
      reference_id: newCollab.id,
      is_read: false,
      created_at: new Date().toISOString()
    };

    try {
      await query(
        `INSERT INTO notifications (id, recipient_role, title, message, type, reference_id, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [autoNotif.id, autoNotif.recipient_role, autoNotif.title, autoNotif.message, autoNotif.type, autoNotif.reference_id, autoNotif.is_read, autoNotif.created_at]
      );
    } catch (e) {
      memoryStore.notifications.unshift(autoNotif);
    }

    // Broadcast in real-time via Socket.io
    broadcastNotification(recipientRole, autoNotif);
    broadcastCollaboration(newCollab);

    return res.status(201).json({
      success: true,
      message: 'Collaboration initiated and notifications automatically dispatched in real-time.',
      collaboration: newCollab
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/collaborations/:id
 * Accept, sign MOU, or update collaboration status with automatic cross-notification
 */
export async function updateCollaboration(req, res, next) {
  try {
    const { id } = req.params;
    const {
      status,
      mou_status,
      committed_amount,
      details,
      updated_by = 'industry' // who performed this action
    } = req.body;

    let existing = null;
    try {
      const resDb = await query('SELECT * FROM collaborations WHERE id = $1', [id]);
      if (resDb.rows.length > 0) existing = resDb.rows[0];
    } catch (e) {
      existing = memoryStore.collaborations.find(c => c.id === id);
    }

    const updatedCollab = {
      ...(existing || {}),
      id,
      status: status || existing?.status || 'Active MOU',
      mou_status: mou_status || existing?.mou_status || 'Active MOU',
      committed_amount: committed_amount || existing?.committed_amount || '₹2,50,000',
      details: details || existing?.details || '',
      updated_at: new Date().toISOString()
    };

    try {
      await query(
        `UPDATE collaborations 
         SET status = $1, mou_status = $2, committed_amount = $3, details = $4, updated_at = $5 
         WHERE id = $6`,
        [updatedCollab.status, updatedCollab.mou_status, updatedCollab.committed_amount, updatedCollab.details, updatedCollab.updated_at, id]
      );
    } catch (e) {
      const idx = memoryStore.collaborations.findIndex(c => c.id === id);
      if (idx !== -1) {
        memoryStore.collaborations[idx] = updatedCollab;
      }
    }

    // Automatically notify other party
    const recipientRole = updated_by === 'industry' ? 'university' : 'industry';
    const notifTitle = `Collaboration Confirmed: ${updatedCollab.company_name || 'Partner'}`;
    const notifMessage = `Project ${updatedCollab.project_id || ''} collaboration status is now: ${updatedCollab.status} with ${updatedCollab.committed_amount} fund allocated.`;

    const autoNotif = {
      id: `notif-${Date.now()}`,
      recipient_role: recipientRole,
      title: notifTitle,
      message: notifMessage,
      type: 'COLLABORATION',
      reference_id: id,
      is_read: false,
      created_at: new Date().toISOString()
    };

    try {
      await query(
        `INSERT INTO notifications (id, recipient_role, title, message, type, reference_id, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [autoNotif.id, autoNotif.recipient_role, autoNotif.title, autoNotif.message, autoNotif.type, autoNotif.reference_id, autoNotif.is_read, autoNotif.created_at]
      );
    } catch (e) {
      memoryStore.notifications.unshift(autoNotif);
    }

    broadcastNotification(recipientRole, autoNotif);
    broadcastCollaboration(updatedCollab);

    return res.status(200).json({
      success: true,
      message: 'Collaboration updated and automatic notification sent.',
      collaboration: updatedCollab
    });
  } catch (err) {
    next(err);
  }
}
