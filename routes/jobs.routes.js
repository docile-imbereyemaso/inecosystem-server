import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  getCompanyJobs,
  updateJob,
  deleteJob,
  getJobsBySector,
  searchJobs
} from '../controllers/jobs.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with authentication)
router.get('/', authenticateToken, getJobs);
router.get('/sector/recommended', authenticateToken, getJobsBySector);
router.get('/search', authenticateToken, searchJobs);
router.get('/:id', authenticateToken, getJobById);

// Company-specific routes
router.get('/company/my-jobs', authenticateToken, getCompanyJobs);

// Private sector routes (approved companies only)
router.post('/', authenticateToken, createJob);
router.put('/:id', authenticateToken, updateJob);
router.delete('/:id', authenticateToken, deleteJob);

export default router;