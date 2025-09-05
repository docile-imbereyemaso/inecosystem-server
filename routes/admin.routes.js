import express from 'express';
import {
  approvePrivateSectorUser,
  getPendingApprovals,
  addInsightComment,
  getStatistics
} from '../controllers/admin.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require TVET admin authentication
router.get('/pending-approvals', authenticateToken, getPendingApprovals);
router.post('/approve-user/:userId', authenticateToken, approvePrivateSectorUser);
router.post('/insight-comment/:insightId', authenticateToken, addInsightComment);
router.get('/statistics', authenticateToken, getStatistics);

export default router;