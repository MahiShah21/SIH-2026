import express from 'express';
import { getIndustryPartners, createIndustryPartner, getIndustryProblems } from '../controllers/industryController.js';

const router = express.Router();

router.get('/', getIndustryPartners);
router.get('/problems', getIndustryProblems);
router.post('/', createIndustryPartner);

export default router;

