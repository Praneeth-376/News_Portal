const express = require('express');
const router = express.Router();

// Get user preferences
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      preferences: {
        darkMode: false,
        selectedCountry: 'us',
        selectedCategories: ['general', 'technology', 'business'],
        notifications: true,
        language: 'en'
      }
    }
  });
});

// Update user preferences
router.put('/', async (req, res) => {
  try {
    const { darkMode, selectedCountry, selectedCategories, notifications, language } = req.body;
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: {
          darkMode: darkMode || false,
          selectedCountry: selectedCountry || 'us',
          selectedCategories: selectedCategories || ['general'],
          notifications: notifications !== undefined ? notifications : true,
          language: language || 'en',
          updatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences'
    });
  }
});

module.exports = router;