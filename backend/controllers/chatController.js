import { query, memoryStore } from '../config/db.js';
import { getIO, broadcastNotification } from '../socket/socketHandler.js';

/**
 * GET /api/chat/conversations
 * Fetch all active conversations
 */
export async function getConversations(req, res, next) {
  try {
    const { role = 'university', project_id } = req.query;
    let conversations = [];

    try {
      let sql = 'SELECT * FROM conversations WHERE 1=1';
      const params = [];
      if (project_id) {
        params.push(project_id);
        sql += ` AND project_id = $${params.length}`;
      }
      sql += ' ORDER BY last_message_at DESC';
      const resDb = await query(sql, params);
      conversations = resDb.rows;
    } catch (e) {
      conversations = [...memoryStore.conversations];
      if (project_id) {
        conversations = conversations.filter(c => c.project_id === project_id);
      }
    }

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations
 * Create or get conversation
 */
export async function createConversation(req, res, next) {
  try {
    const {
      project_id = 'PRJ-315',
      title = 'Project Communication Channel',
      participant_university = 'Dr. A. K. Sharma (BIT Mesra)',
      participant_industry = 'TechNova Systems Team'
    } = req.body;

    const newConv = {
      id: `conv-${Date.now()}`,
      project_id,
      title,
      participant_university,
      participant_industry,
      last_message: 'Conversation started.',
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    try {
      await query(
        `INSERT INTO conversations (id, project_id, title, participant_university, participant_industry, last_message, last_message_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [newConv.id, newConv.project_id, newConv.title, newConv.participant_university, newConv.participant_industry, newConv.last_message, newConv.last_message_at]
      );
    } catch (e) {
      memoryStore.conversations.unshift(newConv);
    }

    return res.status(201).json({
      success: true,
      conversation: newConv
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/conversations/:id/messages
 * Fetch messages for a specific conversation
 */
export async function getMessages(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    let messages = [];

    try {
      const resDb = await query(
        'SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [conversationId]
      );
      messages = resDb.rows;
    } catch (e) {
      messages = memoryStore.chat_messages
        .filter(m => m.conversation_id === conversationId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations/:id/messages
 * Send message via HTTP REST and broadcast to Socket.io
 */
export async function sendMessage(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const {
      sender_role = 'university',
      sender_name = 'Dr. A. K. Sharma (BIT Mesra)',
      recipient_role = 'industry',
      text = ''
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      conversation_id: conversationId,
      sender_role,
      sender_name,
      recipient_role,
      text: text.trim(),
      is_read: false,
      created_at: new Date().toISOString()
    };

    try {
      await query(
        `INSERT INTO chat_messages (id, conversation_id, sender_role, sender_name, recipient_role, text, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newMsg.id, newMsg.conversation_id, newMsg.sender_role, newMsg.sender_name, newMsg.recipient_role, newMsg.text, newMsg.is_read, newMsg.created_at]
      );

      await query(
        `UPDATE conversations SET last_message = $1, last_message_at = $2 WHERE id = $3`,
        [newMsg.text, newMsg.created_at, conversationId]
      );
    } catch (e) {
      memoryStore.chat_messages.push(newMsg);
      const cIdx = memoryStore.conversations.findIndex(c => c.id === conversationId);
      if (cIdx !== -1) {
        memoryStore.conversations[cIdx].last_message = newMsg.text;
        memoryStore.conversations[cIdx].last_message_at = newMsg.created_at;
      }
    }

    // Socket.io Real-Time Broadcast
    const io = getIO();
    if (io) {
      io.to(`conv_${conversationId}`).emit('new_message', newMsg);
      io.emit('global_chat_message', newMsg);
    }

    // Real-Time Notification to recipient role
    if (recipient_role) {
      const notif = {
        id: `notif-${Date.now()}`,
        recipient_role: recipient_role.toLowerCase(),
        title: `New Message from ${sender_name}`,
        message: text.length > 80 ? text.substring(0, 80) + '...' : text,
        type: 'MESSAGE',
        reference_id: conversationId,
        is_read: false,
        created_at: new Date().toISOString()
      };

      try {
        await query(
          `INSERT INTO notifications (id, recipient_role, title, message, type, reference_id, is_read, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [notif.id, notif.recipient_role, notif.title, notif.message, notif.type, notif.reference_id, notif.is_read, notif.created_at]
        );
      } catch (e) {
        memoryStore.notifications.unshift(notif);
      }

      broadcastNotification(recipient_role, notif);
    }

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: newMsg
    });
  } catch (err) {
    next(err);
  }
}
