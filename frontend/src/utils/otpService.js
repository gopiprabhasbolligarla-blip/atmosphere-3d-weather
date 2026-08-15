/**
 * OTP Service & Generator Module
 * Handles 6-digit OTP generation, simulated SMS dispatching, session storage, and validation.
 */

// In-memory store for active OTP sessions
const activeOtpSessions = new Map();

/**
 * Generate a random N-digit numeric OTP code
 * @param {number} length - Number of digits (default: 6)
 * @returns {string} OTP code
 */
export function generateOTP(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

/**
 * Create and send OTP to a mobile number
 * @param {string} phoneNumber - User's mobile number with country code
 * @param {number} validitySeconds - Expiry duration in seconds (default: 60)
 * @returns {Object} Session object with status, expiry, and masked phone
 */
export function sendMobileOTP(phoneNumber, validitySeconds = 60) {
  if (!phoneNumber || phoneNumber.trim().length < 6) {
    throw new Error('Please enter a valid mobile number');
  }

  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  const otpCode = generateOTP(6);
  const expiresAt = Date.now() + validitySeconds * 1000;

  const session = {
    phoneNumber: cleanPhone,
    code: otpCode,
    expiresAt,
    validitySeconds,
    createdTime: Date.now()
  };

  activeOtpSessions.set(cleanPhone, session);

  // Dispatch global custom event to trigger realistic SMS notification toast
  if (typeof window !== 'undefined') {
    const smsEvent = new CustomEvent('simulated_sms_received', {
      detail: {
        phoneNumber: cleanPhone,
        code: otpCode,
        expiresAt,
        message: `Your Atmosphere Weather verification OTP is ${otpCode}. Valid for ${validitySeconds} seconds. Do not share this code.`
      }
    });
    window.dispatchEvent(smsEvent);
  }

  console.log(`[OTP Service] Sent OTP ${otpCode} to ${cleanPhone}`);

  return {
    success: true,
    phoneNumber: cleanPhone,
    expiresAt,
    validitySeconds,
    // Included for dev preview ease
    previewCode: otpCode
  };
}

/**
 * Verify an input OTP code against active session
 * @param {string} phoneNumber - User's mobile number
 * @param {string} inputCode - 6-digit entered OTP
 * @returns {Object} Verification result
 */
export function verifyMobileOTP(phoneNumber, inputCode) {
  if (!phoneNumber) {
    return { success: false, message: 'Mobile number is required' };
  }

  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  const session = activeOtpSessions.get(cleanPhone);

  if (!session) {
    return { success: false, message: 'No active OTP request found for this number. Please request a new code.' };
  }

  if (Date.now() > session.expiresAt) {
    activeOtpSessions.delete(cleanPhone);
    return { success: false, message: 'OTP code has expired. Please request a new code.' };
  }

  if (session.code !== inputCode.trim()) {
    return { success: false, message: 'Invalid OTP code. Please check the 6-digit code and try again.' };
  }

  // OTP verified successfully - clear session
  activeOtpSessions.delete(cleanPhone);

  return {
    success: true,
    message: 'Mobile number verified successfully!',
    user: {
      id: `user_phone_${cleanPhone.slice(-4)}`,
      name: `User ${cleanPhone.slice(-4)}`,
      mobile: cleanPhone,
      authMethod: 'mobile',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanPhone}`
    }
  };
}

/**
 * Resend OTP for existing mobile number
 * @param {string} phoneNumber 
 */
export function resendMobileOTP(phoneNumber) {
  return sendMobileOTP(phoneNumber);
}
