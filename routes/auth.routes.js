import express from 'express';
import { 
  individualSignup, 
  privateSectorSignup, 
  login, 
  getProfile 
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup/individual', individualSignup);
router.post('/signup/private-sector', privateSectorSignup);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;