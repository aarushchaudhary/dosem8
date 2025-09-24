// middleware/premiumPharmacyAuth.js
const Pharmacy = require('../models/Pharmacy');

module.exports = async function(req, res, next) {
    try {
        // Find the pharmacy by the ID that was attached by the standard authMiddleware
        const pharmacy = await Pharmacy.findById(req.user.id);

        // Check if the pharmacy's plan is 'premium'
        if (pharmacy && pharmacy.subscription.plan === 'premium') {
            // If they are premium, proceed to the controller
            next();
        } else {
            // If not, deny access with a 403 Forbidden error
            return res.status(403).json({ success: false, message: 'Premium access required for this feature.' });
        }
    } catch (error) {
        console.error('Premium pharmacy auth error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};