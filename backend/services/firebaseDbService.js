/**
 * Backend Firebase Database Service
 * Connects to Google Firebase Realtime Database REST API to persist:
 * - User Total Login Count (recordUserLogin)
 * - User Search History (saveSearchHistory)
 */

const FIREBASE_DB_URL = 'https://myweatherapp-4678c-default-rtdb.firebaseio.com';

// Local cache store
const userDatabase = new Map();

/**
 * Record User Login & Increment Login Count in Firebase
 * @param {Object} user 
 */
export async function recordUserLogin(user) {
  const userId = user.id || `user_${user.mobile || user.email}`;
  const sanitizedId = userId.replace(/[^a-zA-Z0-9]/g, '_');
  
  const existing = userDatabase.get(sanitizedId) || {
    id: sanitizedId,
    name: user.name || 'Weather App User',
    mobile: user.mobile || '',
    email: user.email || '',
    authMethod: user.authMethod || 'otp',
    loginCount: 0,
    searchHistory: [],
    savedLocations: [],
    createdAt: new Date().toISOString()
  };

  existing.loginCount += 1;
  existing.lastLogin = new Date().toISOString();
  userDatabase.set(sanitizedId, existing);

  // Sync with Firebase Realtime Database via REST API
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/users/${sanitizedId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(existing)
    });
    if (response.ok) {
      console.log(`[Firebase DB] Recorded login for ${sanitizedId} in Google Firebase. Total Logins: ${existing.loginCount}`);
    }
  } catch (error) {
    console.error(`[Firebase DB Warning] Failed to sync with Firebase cloud: ${error.message}. Saved locally.`);
  }

  return existing;
}

/**
 * Save Search Query to User History in Firebase
 * @param {string} userId 
 * @param {string} locationName 
 */
export async function saveSearchHistory(userId, locationName) {
  const sanitizedId = userId.replace(/[^a-zA-Z0-9]/g, '_');
  const historyItem = {
    location: locationName,
    timestamp: new Date().toISOString()
  };

  const user = userDatabase.get(sanitizedId) || { id: sanitizedId, searchHistory: [], loginCount: 1 };
  if (!user.searchHistory) user.searchHistory = [];
  user.searchHistory.unshift(historyItem);
  userDatabase.set(sanitizedId, user);

  // Sync to Firebase
  try {
    await fetch(`${FIREBASE_DB_URL}/history/${sanitizedId}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(historyItem)
    });
    console.log(`[Firebase DB] Saved search history for ${sanitizedId}: ${locationName}`);
  } catch (error) {
    console.error(`[Firebase DB Warning] Search history sync failed: ${error.message}`);
  }

  return historyItem;
}

/**
 * Get User Profile & History from Firebase or Cache
 * @param {string} userId 
 */
export async function getUserProfile(userId) {
  const sanitizedId = userId.replace(/[^a-zA-Z0-9]/g, '_');

  // Try fetching latest state from Firebase Realtime DB
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/users/${sanitizedId}.json`);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        userDatabase.set(sanitizedId, data);
        return data;
      }
    }
  } catch (error) {
    console.error(`[Firebase DB Fetch Warning] ${error.message}`);
  }

  return userDatabase.get(sanitizedId) || null;
}
