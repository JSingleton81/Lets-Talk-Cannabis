/**
 * Backend Route: GET /api/auth/status/:uid
 * 
 * Returns the current verification status for a given Firebase UID.
 * This enables the frontend to check if a user is verified without relying solely on localStorage.
 * 
 * Usage in your Express server:
 * const authStatusRoute = require('./backend-auth-status-route');
 * app.use('/api/auth', authStatusRoute);
 */

const express = require('express');
const router = express.Router();
const UserModel = require('./models/userModel'); // Adjust path to your user model

/**
 * GET /api/auth/status/:uid
 * Fetch user verification status by Firebase UID
 */
router.get('/status/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ message: 'Firebase UID is required' });
    }

    // Query your MySQL database for the user
    const user = await UserModel.findByFirebaseUid(uid);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the verification status and any other relevant user data
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      is_verified_21: user.is_verified_21,
      verification_status: user.verification_status,
      created_at: user.created_at
    });

  } catch (error) {
    console.error('❌ Error fetching user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
