import express from 'express';
import { getFeedbacks, submitFeedback, getImpactStats } from '../controllers/feedbackController.js';

const router = express.Router();

router.get('/', getFeedbacks);
router.post('/', submitFeedback);
router.get('/impact-stats', getImpactStats);

export default router;
