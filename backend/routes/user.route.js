const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
    // ✅ 1. Check for session-based authentication
    if (req.session && req.session.userId) {
        return next();
    }
    
    // ✅ 2. Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.substring(7); // remove "Bearer "
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');

            // Make sure decoded data is attached properly
            req.user = { _id: decoded.userId, email: decoded.email };
            return next();
        } catch (error) {
            console.error('JWT verification failed:', error);
            return res.status(401).json({ error: "Invalid or expired token" });
        }
    }
    
    // ✅ 3. For API requests, return JSON error
    const isApiRequest = req.headers.accept && req.headers.accept.includes('application/json');
    if (isApiRequest) {
        return res.status(401).json({ error: "Not authenticated. Please login first." });
    }
    
    // ✅ 4. Otherwise return generic Unauthorized
    res.status(401).json({ error: 'Unauthorized' });
};

module.exports = { isAuthenticated };
