const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT authentication middleware for API endpoints
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // Fallback to session-based authentication
      if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
      }
      if (req.session && req.session.userId) {
        return next();
      }
      return res.status(401).json({ error: 'Access token required' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key-for-token-signing';
    
    jwt.verify(token, jwtSecret, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      // Get user from token
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(403).json({ error: 'User not found' });
      }

      req.user = user;
      req.token = token;
      next();
    });
  } catch (error) {
    console.error('JWT Authentication error:', error);
    return res.status(500).json({ error: 'Authentication server error' });
  }
};

// Generate JWT token for user
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key-for-token-signing';
  return jwt.sign(
    { userId },
    jwtSecret,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Verify JWT token without middleware
const verifyToken = (token) => {
  const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key-for-token-signing';
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateToken,
  generateToken,
  verifyToken
};