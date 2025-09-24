// controllers/healthTipController.js
const HealthTip = require('../models/HealthTip');

// @desc    Get all health tips or search by keyword
// @route   GET /api/health-tips
// @route   GET /api/health-tips?q=keyword
// @access  Private
exports.getHealthTips = async (req, res) => {
    try {
        let query;
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // If the 'new' query param is present, filter by date
        if (req.query.new === 'true') {
            query = HealthTip.find({ createdAt: { $gte: twentyFourHoursAgo } });
        } 
        // If there is a search query 'q' in the URL
        else if (req.query.q) {
            query = HealthTip.find(
                { $text: { $search: req.query.q } },
                { score: { $meta: 'textScore' } }
            ).sort({ score: { $meta: 'textScore' } });
        } else {
            // Otherwise, get all tips, sorted by newest first
            query = HealthTip.find().sort({ createdAt: -1 });
        }

        // Populate the pharmacy field with the pharmacyName
        const tips = await query.populate('pharmacy', 'pharmacyName');

        res.status(200).json({ success: true, count: tips.length, data: tips });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ... (rest of the file remains the same)

// --- Admin Functions (for future implementation) ---

// @desc    Create a new health tip
// @route   POST /api/health-tips
// @access  Admin-Only
exports.createHealthTip = async (req, res) => {
    // In a real app, you'd have an admin middleware check here
    try {
        const tip = await HealthTip.create(req.body);
        res.status(201).json({ success: true, data: tip });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};