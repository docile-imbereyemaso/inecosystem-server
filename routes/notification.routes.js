// src/routes/notificationRoutes.js
import express from 'express';
import {
  createNotification,
  getAllNotifications,
  getNotificationsByRecipient,
  markAsRead,
  deleteNotification
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/notifications
router.post('/', authenticateToken, createNotification);

// GET /api/notifications
router.get('/',  authenticateToken ,getAllNotifications);

// GET /api/notifications/filter?recipient_type=user&recipient_id=1
router.get('/filter', authenticateToken, getNotificationsByRecipient);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateToken, markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', authenticateToken, deleteNotification);

export default router;
