import { Router } from 'express';
import { getProfile, addHistory } from '../controllers/userController.js';

const router = Router();

// Endpoint: Fetch user profile, total login count & search history
router.get('/:userId', getProfile);

// Endpoint: Record search history to Firebase DB
router.post('/:userId/history', addHistory);

export default router;
