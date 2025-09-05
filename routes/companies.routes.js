import express from 'express';
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} from '../controllers/companies.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes protected with authentication
router.post('/', authenticateToken, createCompany);
router.get('/', authenticateToken, getCompanies);
router.get('/:id', authenticateToken, getCompanyById);
router.put('/:id', authenticateToken, updateCompany);
router.delete('/:id', authenticateToken, deleteCompany);

export default router;