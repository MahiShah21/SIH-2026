import { query, memoryStore } from '../config/db.js';
import { broadcastNotification } from '../socket/socketHandler.js';

/**
 * GET /api/notifications
 * Fetch notifications for a specific persona role (university, industry, etc.)
 */
export async function getNotifications(req, res, next) {
  try {
    const { role = 'university' } = req.query;
    let notifications = [];

    try {
      let sql = 'SELECT * FROM notifications WHERE 1=1';
      const params = [];
      if (role && role !== 'all') {
        params.push(role.toLowerCase());
        sql += ` AND LOWER(recipient_role) = $${params.length}`;
      }
      sql += ' ORDER BY created_at DESC LIMIT 50';
      const resDb = await query(sql, params);
      notifications = resDb.rows;
    } catch (e) {
      notifications = [...memoryStore.notifications];
      if (role && role !== 'all') {
        notifications = notifications.filter(
          n => n.recipient_role?.toLowerCase() === role.toLowerCase()
        );
      }
      notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark single notification as read
 */
export async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;

    try {
      await query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);
    } catch (e) {
      const idx = memoryStore.notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        memoryStore.notifications[idx].is_read = true;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications for a role as read
 */
export async function markAllNotificationsRead(req, res, next) {
  try {
    const { role = 'university' } = req.body;

    try {
      await query('UPDATE notifications SET is_read = true WHERE LOWER(recipient_role) = $1', [role.toLowerCase()]);
    } catch (e) {
      memoryStore.notifications.forEach(n => {
        if (n.recipient_role?.toLowerCase() === role.toLowerCase()) {
          n.is_read = true;
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `All ${role} notifications marked as read.`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/notifications
 * Create and broadcast a new notification
 */
export async function createNotification(req, res, next) {
  try {
    const {
      recipient_role = 'university',
      recipient_id = null,
      title = 'System Notification',
      message = '',
      type = 'COLLABORATION',
      reference_id = null
    } = req.body;

    const notif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipient_role: recipient_role.toLowerCase(),
      recipient_id,
      title,
      message,
      type,
      reference_id,
      is_read: false,
      created_at: new Date().toISOString()
    };

    try {
      await query(
        `INSERT INTO notifications (id, recipient_role, recipient_id, title, message, type, reference_id, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [notif.id, notif.recipient_role, notif.recipient_id, notif.title, notif.message, notif.type, notif.reference_id, notif.is_read, notif.created_at]
      );
    } catch (e) {
      memoryStore.notifications.unshift(notif);
    }

    // Broadcast via socket
    broadcastNotification(recipient_role, notif);

    return res.status(201).json({
      success: true,
      notification: notif
    });
  } catch (err) {
    next(err);
  }
}
