import express from 'express';
import { classifyProblem, checkDuplicates, chatCopilot, generateMoU } from '../controllers/aiController.js';

const router = express.Router();

router.post('/classify-problem', classifyProblem);
router.post('/check-duplicates', checkDuplicates);
router.post('/chat', chatCopilot);
router.post('/generate-mou', generateMoU);

export default router;

