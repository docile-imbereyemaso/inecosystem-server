import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserConnections,
  addConnection,
  removeConnection,
  getUserStats,
  searchUsers,
  getConnectedUsers,
  getPendingConnections,
  acceptConnection,
  rejectConnection
} from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User profile routes
router.get('/profile/:userId', getUserProfile);
router.put('/profile/:userId', updateUserProfile);
router.get('/stats/:userId', getUserStats);

// User connections routes
router.get('/:userId/connections', getUserConnections);
router.get('/:userId/connected-users', getConnectedUsers);
router.get('/:userId/pending-connections', getPendingConnections);
router.post('/:userId/connections/:targetUserId', addConnection);
router.post('/:userId/connections/:requestId/accept', acceptConnection);
router.post('/:userId/connections/:requestId/reject', rejectConnection);
router.delete('/:userId/connections/:targetUserId', removeConnection);

// Search routes
router.get('/search', searchUsers);

export default router;