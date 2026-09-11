import express from 'express';
import { login, register, quickDemoLogin, getCurrentUser, getDemoCredentials, getUsers } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/quick-demo', quickDemoLogin);
router.get('/me', requireAuth, getCurrentUser);
router.get('/demo-credentials', getDemoCredentials);
router.get('/users', getUsers);

export default router;

