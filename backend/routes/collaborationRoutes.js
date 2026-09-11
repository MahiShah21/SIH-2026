import { Router } from 'express';
import {
  getCollaborations,
  createCollaboration,
  updateCollaboration
} from '../controllers/collaborationController.js';

const router = Router();

router.get('/', getCollaborations);
router.post('/', createCollaboration);
router.patch('/:id', updateCollaboration);

export default router;
