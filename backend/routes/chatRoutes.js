import { Router } from 'express';
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage
} from '../controllers/chatController.js';

const router = Router();

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);

export default router;
