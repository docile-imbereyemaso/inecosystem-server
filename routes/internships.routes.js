import express from 'express';
import {
  createInternship,
  getInternships,
  getInternshipById,
  getCompanyInternships,
  updateInternship,
  deleteInternship,
  getInternshipsBySector
} from '../controllers/internships.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with authentication)
router.get('/', authenticateToken, getInternships);
router.get('/:id', authenticateToken, getInternshipById);

// Individual user routes
router.get('/sector/recommended', authenticateToken, getInternshipsBySector);

// Private sector user routes
router.post('/', authenticateToken, createInternship);
router.get('/company/my-internships', authenticateToken, getCompanyInternships);
router.put('/:id', authenticateToken, updateInternship);
router.delete('/:id', authenticateToken, deleteInternship);

export default router;