import express from 'express';
import { getProblems, getProblemById, createProblem, upvoteProblem, updateProblemStatus } from '../controllers/problemController.js';

const router = express.Router();

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/', createProblem);
router.post('/:id/upvote', upvoteProblem);
router.patch('/:id/status', updateProblemStatus);

export default router;
