import express from 'express';
import {
  approvePrivateSectorUser,
  getPendingApprovals,
  addInsightComment,
  getStatistics,
  getAll,
  getAllUsers,
  getPrivateSectorByStatus,
  
} from '../controllers/admin.controller.js';

import{getAllOpportunities,createOpportunity} from '../controllers/Opportunity.controller.js'
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require TVET admin authentication
router.get('/pending-approvals', authenticateToken, getPendingApprovals);
router.get('/list', authenticateToken, getAll);
router.get('/status',authenticateToken,getPrivateSectorByStatus);
router.get('/getopportunities',authenticateToken,getAllOpportunities)
router.post('/addopportunity',authenticateToken,createOpportunity)
router.get('/allusers',authenticateToken,getAllUsers)
router.post('/approve-user/:userId', authenticateToken, approvePrivateSectorUser);
router.post('/insight-comment/:insightId', authenticateToken, addInsightComment);
router.get('/statistics', authenticateToken, getStatistics);

export default router;