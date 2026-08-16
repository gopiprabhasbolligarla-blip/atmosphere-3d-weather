import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createAndSendOtp, verifyOtpCode } from '../services/otpService.js';
import { recordUserLogin } from '../services/firebaseDbService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

/**
 * Retrieve mandatory JWT Secret from environment variables
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('[Security Error] JWT_SECRET is not configured in .env environment file.');
  }
  return secret;
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
    const { phoneNumber, code, fullName } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ success: false, message: 'Phone number and 6-digit OTP code are required.' });
    }

    const verification = verifyOtpCode(phoneNumber, code, fullName);
    if (!verification.success) {
      return res.status(400).json(verification);
    }

    // Record login & track total sign-in count in Firebase
    const userProfile = await recordUserLogin(verification.user);

    // Generate JWT Token using strictly required environment secret
    const token = jwt.sign(
      { id: userProfile.id, mobile: userProfile.mobile },
      getJwtSecret(),
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
    if (!profile || (!profile.id && !profile.email)) {
      return res.status(400).json({ success: false, message: 'Valid Google user profile object is required.' });
    }

    // Record login in Google Firebase Database & increment login count
    const userProfile = await recordUserLogin({
      id: profile.id || `google_${profile.email}`,
      name: profile.name || profile.displayName || 'Google User',
      email: profile.email || '',
      avatar: profile.avatar || profile.photoURL || '',
      authMethod: 'google'
    });

    const token = jwt.sign({ id: userProfile.id, email: userProfile.email }, getJwtSecret(), { expiresIn: '7d' });

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
