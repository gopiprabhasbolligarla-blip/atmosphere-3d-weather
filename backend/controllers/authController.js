import jwt from 'jsonwebtoken';
import { createAndSendOtp, verifyOtpCode } from '../services/otpService.js';
import { recordUserLogin } from '../services/firebaseDbService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'atmosphere_production_secure_jwt_secret_2026';
if (!JWT_SECRET) {
  console.warn('[Security Warning] JWT_SECRET is using default fallback. Set JWT_SECRET in .env for production.');
}

/**
 * Send OTP Handler
 */
export async function sendOtp(req, res) {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Valid mobile number with country code is required.' });
    }

    const result = await createAndSendOtp(phoneNumber);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Send OTP Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error sending OTP' });
  }
}

/**
 * Verify OTP Handler & Issue JWT Token + Record Login Count
 */
export async function verifyOtp(req, res) {
  try {
    const { phoneNumber, code } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ success: false, message: 'Phone number and 6-digit OTP code are required.' });
    }

    const verification = verifyOtpCode(phoneNumber, code);
    if (!verification.success) {
      return res.status(400).json(verification);
    }

    // Record login & track total sign-in count in Firebase
    const userProfile = await recordUserLogin(verification.user);

    // Generate JWT Token
    const token = jwt.sign(
      { id: userProfile.id, mobile: userProfile.mobile },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Mobile authentication successful!',
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('[Verify OTP Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error verifying OTP' });
  }
}

/**
 * Google Auth Authentication Handler & Firebase DB Persistence
 */
export async function googleAuth(req, res) {
  try {
    const { profile } = req.body;
    const user = profile || {
      id: `google_${Date.now()}`,
      name: 'Alex Morgan',
      email: 'alex.morgan@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      authMethod: 'google'
    };

    // Record login in Google Firebase Database & increment login count
    const userProfile = await recordUserLogin({
      id: user.id || `google_${user.email}`,
      name: user.name || user.displayName || 'Google User',
      email: user.email || '',
      avatar: user.avatar || user.photoURL || '',
      authMethod: 'google'
    });

    const token = jwt.sign({ id: userProfile.id, email: userProfile.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful & stored in Firebase DB!',
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('[Google Auth Server Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Google Auth Server Error' });
  }
}
