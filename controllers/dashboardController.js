// controllers/dashboardController.js
const Pharmacy = require('../models/Pharmacy');

// @desc    Get dashboard data for the logged-in pharmacy
// @route   GET /api/dashboard
// @access  Private (requires authentication middleware)
exports.getDashboardData = async (req, res) => {
    try {
        // req.user.id is available because an auth middleware would have decoded the JWT
        // and attached the user payload to the request object.
        const pharmacy = await Pharmacy.findById(req.user.id).select('-password');

        if (!pharmacy) {
            return res.status(404).json({ success: false, message: 'Pharmacy not found' });
        }

        res.status(200).json({ success: true, data: pharmacy });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};