// ENHANCED auth.js - JWT Authentication Middleware with Session Support
const jwt = require("jsonwebtoken");

// JWT-based authentication middleware
const protect = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

// Session-based authentication middleware (for backward compatibility)
const isAuthenticated = (req, res, next) => {
  // Check JWT token first
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
      } catch (err) {
        // JWT failed, fall back to session
      }
    }
  }

  // Fall back to session-based authentication
  if (req.session && req.session.userId) {
    // For session-based auth, create a user object
    req.user = {
      _id: req.session.userId,
      userId: req.session.userId
    };
    return next();
  }

  // No authentication found
  if (req.xhr || req.headers.accept.indexOf("json") > -1) {
    return res.status(401).json({ message: "Authentication required" });
  } else {
    return res.redirect("/login");
  }
};

// Optional authentication - doesn't block if not authenticated
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (err) {
        // Token invalid, but continue without user
        req.user = null;
      }
    }
  }

  // Check session as fallback
  if (!req.user && req.session && req.session.userId) {
    req.user = {
      _id: req.session.userId,
      userId: req.session.userId
    };
  }

  next();
};

// Generate JWT token
const generateToken = (userId, username, email) => {
  return jwt.sign(
    { 
      _id: userId,
      userId: userId,
      username: username,
      email: email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  // First ensure user is authenticated
  const authCheck = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = decoded;
          return next();
        } catch (err) {
          return res.status(403).json({ message: "Invalid token" });
        }
      }
    }

    if (req.session && req.session.userId) {
      req.user = {
        _id: req.session.userId,
        userId: req.session.userId
      };
      return next();
    }

    return res.status(401).json({ message: "Authentication required" });
  };

  authCheck(req, res, () => {
    // Check if user is admin (you'll need to implement this logic based on your User model)
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Admin access required" });
    }
  });
};

// Rate limiting middleware (basic implementation)
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, timestamp] of requests.entries()) {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    }

    // Count requests from this IP
    let requestCount = 0;
    for (const [key, timestamp] of requests.entries()) {
      if (key.startsWith(ip) && timestamp > windowStart) {
        requestCount++;
      }
    }

    if (requestCount >= maxRequests) {
      return res.status(429).json({ 
        message: "Too many requests, please try again later" 
      });
    }

    // Record this request
    requests.set(`${ip}-${now}`, now);
    next();
  };
};

module.exports = {
  protect,
  isAuthenticated,
  optionalAuth,
  generateToken,
  verifyToken,
  requireAdmin,
  rateLimiter
};

// For backward compatibility, also export protect as default
module.exports.default = protect;
