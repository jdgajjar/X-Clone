const isAuthenticated = (req, res, next) => {
    // Check for session-based authentication
    if (req.session && req.session.userId) {
        return next();
    }
    
    // Check for JWT token in Authorization header
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
    
    // Check if it's an API request
    const isApiRequest = req.headers.accept && req.headers.accept.includes('application/json');
    if (isApiRequest) {
        return res.status(401).json({ error: "Not authenticated. Please login first." });
    }
    
    res.status(401).json({ error: 'Unauthorized' });
};

module.exports = { isAuthenticated };
