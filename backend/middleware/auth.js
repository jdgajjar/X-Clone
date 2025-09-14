const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() || req.session.userId) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};

module.exports = { isAuthenticated };