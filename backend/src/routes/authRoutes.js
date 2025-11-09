const express = require('express');
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // In a real app, you'd save to database here
    // For now, return success
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: 'user-' + Date.now(),
          name,
          email,
          avatar: null,
          createdAt: new Date().toISOString()
        },
        token: 'jwt-token-' + Date.now()
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Demo authentication - in real app, check against database
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: 'user-123',
          name: email.split('@')[0],
          email,
          avatar: null,
          lastLogin: new Date().toISOString()
        },
        token: 'jwt-token-' + Date.now()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user
router.get('/me', (req, res) => {
  // Demo user data
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

// Logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;