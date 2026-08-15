import { getUserProfile, saveSearchHistory } from '../services/firebaseDbService.js';

/**
 * Get User Profile, Login Count, and Search History
 */
export async function getProfile(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const profile = await getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('[Get Profile Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
  }
}

/**
 * Save Search History to User Profile
 */
export async function addHistory(req, res) {
  try {
    const { userId } = req.params;
    const { location } = req.body;

    if (!userId || !location) {
      return res.status(400).json({ success: false, message: 'User ID and location are required.' });
    }

    const historyItem = await saveSearchHistory(userId, location);
    return res.status(200).json({
      success: true,
      message: 'Search history saved to Firebase',
      historyItem
    });
  } catch (error) {
    console.error('[Add History Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to save search history.' });
  }
}
