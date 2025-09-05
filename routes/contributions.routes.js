import express from 'express';
import {
  createContribution,
  getContributions,
  getContributionById,
  getUserContributions,
  updateContribution,
  deleteContribution,
  likeContribution,
  changeContributionStatus,
  getPopularContributions,
  searchContributions
} from '../controllers/contributions.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with authentication)
router.get('/', authenticateToken, getContributions);
router.get('/popular', authenticateToken, getPopularContributions);
router.get('/search', authenticateToken, searchContributions);
router.get('/:id', authenticateToken, getContributionById);
router.get('/user/:userId', authenticateToken, getUserContributions);

// Protected routes (author only)
router.post('/', authenticateToken, createContribution);
router.put('/:id', authenticateToken, updateContribution);
router.delete('/:id', authenticateToken, deleteContribution);
router.patch('/:id/status', authenticateToken, changeContributionStatus);

// Interaction routes
router.post('/:id/like', authenticateToken, likeContribution);

export default router;