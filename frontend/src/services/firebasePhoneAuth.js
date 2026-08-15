import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebaseConfig';

// Set Firebase Phone Auth 7-Day Test Token provided from Firebase Console
if (typeof window !== 'undefined') {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN =
    'AVweKojskY5duqBYtRZ8yURaOJcQ5eY7tklV9LyhAlLFWM3tLFUDRgQ02g7wX-zgXrTGs4Bi4stGLIJVp29FoyiBtV643LFL-Tw8KwKH5m-4VBDpYy0Ri-lPyr91fhwB5gXlfBWudnGzciK5-lKsViu-TQ';
}

/**
 * Initialize Invisible reCAPTCHA for Phone Authentication
 * @param {string} buttonOrContainerId - DOM element ID for reCAPTCHA
 */
export function initPhoneRecaptcha(buttonOrContainerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;

  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // clear old verifier
    }
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonOrContainerId, {
    size: 'invisible',
    callback: () => {
      console.log('[Firebase Auth] reCAPTCHA verified via Test Token');
    },
    'expired-callback': () => {
      console.warn('[Firebase Auth] reCAPTCHA expired');
    }
  });

  return window.recaptchaVerifier;
}

/**
 * Send REAL SMS OTP to physical mobile phone using Firebase Phone Auth
 * @param {string} phoneNumber - Mobile phone number formatted with country code e.g. +919876543210
 * @param {string} containerId - Element container ID for reCAPTCHA
 */
export async function sendRealSMS(phoneNumber, containerId = 'recaptcha-container') {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase API Keys are not configured yet! Please add your Firebase credentials in firebaseConfig.js to send real SMS.'
    );
  }

  try {
    const verifier = initPhoneRecaptcha(containerId);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    console.log(`[Firebase Phone Auth] Real SMS sent to ${phoneNumber}`);
    return {
      success: true,
      confirmationResult,
      phoneNumber
    };
  } catch (error) {
    console.error('[Firebase Phone Auth Error]', error);
    throw new Error(error.message || 'Failed to send SMS to your mobile phone.');
  }
}

/**
 * Confirm REAL SMS OTP code received on physical phone
 * @param {Object} confirmationResult - Firebase confirmation result object
 * @param {string} otpCode - 6-digit OTP code received on user's phone
 */
export async function confirmRealSMSOTP(confirmationResult, otpCode) {
  if (!confirmationResult) {
    throw new Error('No active SMS verification session found.');
  }

  try {
    const userCredential = await confirmationResult.confirm(otpCode);
    const user = userCredential.user;
    return {
      success: true,
      user: {
        id: user.uid,
        name: user.displayName || `User ${user.phoneNumber.slice(-4)}`,
        mobile: user.phoneNumber,
        authMethod: 'firebase_sms',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.phoneNumber}`
      }
    };
  } catch (error) {
    console.error('[Firebase Verify Error]', error);
    throw new Error('Invalid SMS OTP code. Please check the code sent to your phone.');
  }
}
