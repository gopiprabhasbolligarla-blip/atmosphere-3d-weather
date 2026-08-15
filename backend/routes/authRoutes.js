import { Router } from 'express';
import { sendOtp, verifyOtp, googleAuth } from '../controllers/authController.js';

const router = Router();

// Endpoint: Send OTP to mobile phone
router.post('/send-otp', sendOtp);

// Endpoint: Verify OTP code & login
router.post('/verify-otp', verifyOtp);

// Endpoint: Google OAuth login
router.post('/google', googleAuth);

export default router;
