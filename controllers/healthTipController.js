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

        if (req.query.new === 'true') {
            query = HealthTip.find({ createdAt: { $gte: twentyFourHoursAgo } });
        } 
        else if (req.query.q) {
            query = HealthTip.find(
                { $text: { $search: req.query.q } },
                { score: { $meta: 'textScore' } }
            ).sort({ score: { $meta: 'textScore' } });
        } else {
            query = HealthTip.find().sort({ createdAt: -1 });
        }

        const tips = await query.populate('pharmacy', 'pharmacyName');

        // Filter out tips where the pharmacy might have been deleted or is otherwise missing
        const validTips = tips.filter(tip => {
            if (tip.pharmacy) {
                return true;
            }
            console.warn(`Health tip with ID ${tip._id} has a missing or invalid pharmacy reference.`);
            return false;
        });

        res.status(200).json({ success: true, count: validTips.length, data: validTips });
    } catch (error) {
        console.error("Error fetching health tips:", error);
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