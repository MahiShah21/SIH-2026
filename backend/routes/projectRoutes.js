import express from 'express';
import { 
  getProjects, 
  createProject,
  getProjectById, 
  updateProjectLifecycle, 
  updateProjectBudget, 
  addProjectDocument, 
  addTeamMember, 
  updateProposalGrant,
  getChallenges 
} from '../controllers/projectController.js';

const router = express.Router();

router.get('/', getProjects);
router.post('/', createProject);
router.get('/challenges', getChallenges);
router.get('/:id', getProjectById);
router.patch('/:id/lifecycle', updateProjectLifecycle);
router.patch('/:id/budget', updateProjectBudget);
router.post('/:id/documents', addProjectDocument);
router.post('/:id/teams', addTeamMember);
router.put('/:id/proposals', updateProposalGrant);

export default router;

