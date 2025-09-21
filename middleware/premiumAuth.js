// middleware/premiumAuth.js
const User = require('../models/User');

module.exports = async function(req, res, next) {
    try {
        // Find the user by the ID that was attached by the standard authMiddleware
        const user = await User.findById(req.user.id);

        // Check if the user's plan is 'premium'
        if (user && user.subscription.plan === 'premium') {
            // If they are premium, proceed to the controller
            next();
        } else {
            // If not, deny access with a 403 Forbidden error
            return res.status(403).json({ success: false, message: 'Premium access required for this feature.' });
        }
    } catch (error) {
        console.error('Premium auth error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};