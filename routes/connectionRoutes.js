import express from 'express';
import {
  createConnection,
  updateConnectionStatus,
  getUserConnections,
  getAllConnections,
  getPrivateConnections
} from '../controllers/connectionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createConnection);
router.patch('/:id',authenticateToken, updateConnectionStatus);
router.get('/user/:user_id/private-sectors',authenticateToken, getPrivateConnections);
router.get('/user/:user_id/individuals',authenticateToken, getUserConnections);
// router.get('/', getAllConnections);

export default router;
