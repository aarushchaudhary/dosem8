// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from the header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Attach user payload to the request object
        next(); // Move to the next function (the controller)
    } catch (err) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};