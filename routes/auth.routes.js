import express from 'express';
import { 
  individualSignup, 
  privateSectorSignup, 
  login, 
  getProfile 
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });



// Private sector signup (adjust similarly if files are needed)
router.post(
  '/signup/private-sector', 
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'legalDocument', maxCount: 1 }
  ]), 
  privateSectorSignup
);

// Accepts multiple fields: profileImage (1), resume (1), officialDocument (1)
router.post(
  '/signup/individual', 
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'officialDocument', maxCount: 1 }
  ]), 
  individualSignup
);

router.post('/login', login);

router.get('/profile', authenticateToken, getProfile);

export default router;
