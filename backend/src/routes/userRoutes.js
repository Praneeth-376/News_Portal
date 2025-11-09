const express = require('express');
const router = express.Router();

// Get user profile
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: 'user-123',
        name: 'Demo User',
        email: 'demo@example.com',
        avatar: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    }
  });
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: 'user-123',
          name: name || 'Demo User',
          email: 'demo@example.com',
          avatar: avatar || null,
          updatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
});

module.exports = router;