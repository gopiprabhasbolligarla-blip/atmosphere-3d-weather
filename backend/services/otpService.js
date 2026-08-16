/**
 * Backend OTP Service
 * Handles secure 6-digit OTP generation, session storage, and SMS gateway dispatch.
 */

// Active OTP store: phoneNumber -> { code, expiresAt, createdTime }
const otpStore = new Map();

/**
 * Generate 6-digit random OTP
 */
export function generateOtpCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

/**
 * Request & Send OTP
 * @param {string} phoneNumber 
 */
export async function createAndSendOtp(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  const code = generateOtpCode();
  const expiresAt = Date.now() + 120 * 1000; // 2 minutes

  otpStore.set(cleanPhone, {
    code,
    expiresAt,
    createdTime: Date.now()
  });

  console.log(`[Backend OTP Service] Generated OTP ${code} for ${cleanPhone}`);

  let smsSent = false;
  let providerUsed = 'simulated';

  // Fast2SMS Gateway (If configured in .env)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: code,
          numbers: cleanPhone.replace(/^\+91/, '')
        })
      });
      const data = await response.json();
      if (data.return) {
        smsSent = true;
        providerUsed = 'Fast2SMS';
      }
    } catch (err) {
      console.error('[Fast2SMS Backend Error]', err);
    }
  }

  return {
    success: true,
    phoneNumber: cleanPhone,
    expiresAt,
    smsSent,
    providerUsed,
    message: smsSent
      ? `Real SMS dispatched to ${cleanPhone} via ${providerUsed}!`
      : `OTP generated for ${cleanPhone}! Verification ready.`
  };
}

/**
 * Verify OTP
 * @param {string} phoneNumber 
 * @param {string} inputCode 
 */
export function verifyOtpCode(phoneNumber, inputCode) {
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  const session = otpStore.get(cleanPhone);

  if (!session) {
    return { success: false, message: 'No active OTP session found for this number. Request a new OTP.' };
  }

  if (Date.now() > session.expiresAt) {
    otpStore.delete(cleanPhone);
    return { success: false, message: 'OTP verification code has expired. Request a new OTP.' };
  }

  if (session.code !== inputCode.trim()) {
    return { success: false, message: 'Invalid 6-digit OTP code. Please check and try again.' };
  }

  // Clear session on successful verification
  otpStore.delete(cleanPhone);

  return {
    success: true,
    user: {
      id: `usr_${cleanPhone.slice(-4)}_${Date.now().toString().slice(-4)}`,
      name: `User ${cleanPhone.slice(-4)}`,
      mobile: cleanPhone,
      authMethod: 'mobile_otp',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanPhone}`
    }
  };
}
