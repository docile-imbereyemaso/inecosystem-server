import express from 'express';
import {
  createInsight,
  getInsights,
  getInsightById,
  updateInsight,
  deleteInsight,
  getInsightsBySector
} from '../controllers/insights.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.post('/', authenticateToken, createInsight);
router.get('/', authenticateToken, getInsights);
router.get('/bysector', authenticateToken, getInsightsBySector);
router.get('/:id', authenticateToken, getInsightById);
router.put('/:id', authenticateToken, updateInsight);
router.delete('/:id', authenticateToken, deleteInsight);

export default router;