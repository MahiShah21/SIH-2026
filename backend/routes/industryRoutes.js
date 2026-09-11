import express from 'express';
import { getIndustryPartners, createIndustryPartner } from '../controllers/industryController.js';

const router = express.Router();

router.get('/', getIndustryPartners);
router.post('/', createIndustryPartner);

export default router;
