import express from 'express';
import {
  addCertificate,
  getUserCertificates,
  updateCertificate,
  deleteCertificate
} from '../controllers/certificate.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.post('/certificate', authenticateToken, addCertificate);
router.get('/getUserCertificate', authenticateToken, getUserCertificates);
router.put('/:id', authenticateToken, updateCertificate);
router.delete('/:id', authenticateToken, deleteCertificate);

export default router;