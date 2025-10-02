const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Authentication middleware
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
      req.user = { _id: decoded.userId, email: decoded.email };
      return next();
    } catch (error) {
      console.error('JWT verification failed:', error);
    }
  }
  
  const isApiRequest = req.headers.accept && req.headers.accept.includes('application/json');
  if (isApiRequest) {
    return res.status(401).json({ error: "Not authenticated. Please login first." });
  }
  res.redirect("/login");
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user._id;
    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto,
        IsVerified: user.IsVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
