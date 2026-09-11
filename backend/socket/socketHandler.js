import { Server } from 'socket.io';
import { query, memoryStore } from '../config/db.js';

let ioInstance = null;

export function initSocket(server, allowedOrigins) {
  ioInstance = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`⚡ [Socket.io] Client connected: ${socket.id}`);

    // Join role channel (e.g. 'university', 'industry', 'citizen', 'admin')
    socket.on('join_role', (role) => {
      if (role) {
        const room = `role_${role.toLowerCase()}`;
        socket.join(room);
        console.log(`⚡ [Socket.io] Socket ${socket.id} joined role channel: ${room}`);
      }
    });

    // Join specific conversation room
    socket.on('join_conversation', (conversationId) => {
      if (conversationId) {
        const room = `conv_${conversationId}`;
        socket.join(room);
        console.log(`⚡ [Socket.io] Socket ${socket.id} joined chat room: ${room}`);
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conv_${conversationId}`);
      }
    });

    // Send real-time chat message
    socket.on('send_message', async (data) => {
      try {
        const {
          conversationId = 'conv-1',
          senderRole = 'university',
          senderName = 'Dr. A. K. Sharma (BIT Mesra)',
          recipientRole = 'industry',
          text = ''
        } = data;

        if (!text || !text.trim()) return;

        const newMsg = {
          id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          conversation_id: conversationId,
          sender_role: senderRole,
          sender_name: senderName,
          recipient_role: recipientRole,
          text: text.trim(),
          is_read: false,
          created_at: new Date().toISOString()
        };

        // Persist message to DB / memoryStore
        try {
          await query(
            `INSERT INTO chat_messages (id, conversation_id, sender_role, sender_name, recipient_role, text, is_read, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [newMsg.id, newMsg.conversation_id, newMsg.sender_role, newMsg.sender_name, newMsg.recipient_role, newMsg.text, newMsg.is_read, newMsg.created_at]
          );

          // Update conversation last message
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

        // Broadcast to everyone in the conversation room
        ioInstance.to(`conv_${conversationId}`).emit('new_message', newMsg);
        ioInstance.emit('global_chat_message', newMsg);

        // Also broadcast notification to recipient role
        if (recipientRole) {
          const notif = {
            id: `notif-${Date.now()}`,
            recipient_role: recipientRole.toLowerCase(),
            title: `New Message from ${senderName}`,
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

          ioInstance.to(`role_${recipientRole.toLowerCase()}`).emit('new_notification', notif);
        }
      } catch (err) {
        console.error('⚠️ [Socket.io] Error handling send_message:', err);
      }
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, senderName, isTyping }) => {
      if (conversationId) {
        socket.to(`conv_${conversationId}`).emit('user_typing', { senderName, isTyping });
      }
    });

    socket.on('disconnect', () => {
      console.log(`⚡ [Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

/**
 * Broadcast a real-time notification to a target persona role & persist to database
 */
export async function broadcastNotification(recipientRole, notification) {
  if (!notification) return;
  const role = (recipientRole || notification.recipient_role || 'university').toLowerCase();
  
  const notifObj = {
    id: notification.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipient_role: role,
    title: notification.title || 'Platform Notification',
    message: notification.message || '',
    type: notification.type || 'SYSTEM',
    reference_id: notification.reference_id || null,
    is_read: false,
    created_at: notification.created_at || new Date().toISOString()
  };

  try {
    await query(
      `INSERT INTO notifications (id, recipient_role, title, message, type, reference_id, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [notifObj.id, notifObj.recipient_role, notifObj.title, notifObj.message, notifObj.type, notifObj.reference_id, notifObj.is_read, notifObj.created_at]
    );
  } catch (e) {
    memoryStore.notifications.unshift(notifObj);
  }

  if (ioInstance) {
    ioInstance.to(`role_${role}`).emit('new_notification', notifObj);
    ioInstance.emit('global_notification', notifObj);
  }
}

/**
 * Broadcast a real-time collaboration status update
 */
export function broadcastCollaboration(collaboration) {
  if (!ioInstance) return;
  ioInstance.emit('collaboration_updated', collaboration);
  // Also send specific notifications to university and industry roles
  broadcastNotification('university', {
    id: `notif-${Date.now()}-u`,
    recipient_role: 'university',
    title: `Collaboration Update: ${collaboration.company_name || 'Industry Partner'}`,
    message: `Project ${collaboration.project_id || ''} status is now: ${collaboration.status || 'Active MOU'}.`,
    type: 'COLLABORATION',
    reference_id: collaboration.id,
    is_read: false,
    created_at: new Date().toISOString()
  });
  broadcastNotification('industry', {
    id: `notif-${Date.now()}-i`,
    recipient_role: 'industry',
    title: `Collaboration Update: ${collaboration.project_id || 'Active Project'}`,
    message: `Collaboration with university team updated to: ${collaboration.status || 'Active MOU'}.`,
    type: 'COLLABORATION',
    reference_id: collaboration.id,
    is_read: false,
    created_at: new Date().toISOString()
  });
}
