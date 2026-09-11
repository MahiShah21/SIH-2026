import express from 'express';
import { getStatsOverview } from '../controllers/statsController.js';

const router = express.Router();

router.get('/overview', getStatsOverview);

export default router;
