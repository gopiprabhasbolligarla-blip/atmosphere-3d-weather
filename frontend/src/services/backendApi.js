/**
 * Client REST API Service for connecting React Frontend to Express Backend
 */

const BACKEND_URL = 'http://localhost:5000/api';

/**
 * Send OTP request to Express backend
 * @param {string} phoneNumber 
 */
export async function sendBackendOtp(phoneNumber) {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('[Backend connection notice - using local fallback]', error);
    return { success: false, message: 'Backend connection offline' };
  }
}

/**
 * Verify OTP request to Express backend
 * @param {string} phoneNumber 
 * @param {string} code 
 * @param {string} [fullName]
 */
export async function verifyBackendOtp(phoneNumber, code, fullName = '') {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, code, fullName })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('[Backend verification notice]', error);
    return { success: false, message: 'Backend connection offline' };
  }
}

/**
 * Send Google Authentication profile to Express backend & record in Firebase DB
 * @param {Object} profile 
 */
export async function googleAuthBackend(profile) {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('[Google Backend API Notice]', error);
    return { success: false, message: 'Backend connection offline' };
  }
}

/**
 * Fetch User Profile & Login Count from Express Backend / Firebase DB
 * @param {string} userId 
 */
export async function fetchUserProfile(userId) {
  try {
    const res = await fetch(`${BACKEND_URL}/user/${encodeURIComponent(userId)}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('[Backend Fetch Profile Warning]', error);
    return null;
  }
}

/**
 * Save Weather Search Query to User History in Backend / Firebase DB
 * @param {string} userId 
 * @param {string} location 
 */
export async function saveBackendSearchHistory(userId, location) {
  try {
    const res = await fetch(`${BACKEND_URL}/user/${encodeURIComponent(userId)}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('[Backend Save History Warning]', error);
    return null;
  }
}
