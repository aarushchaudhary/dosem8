// controllers/pharmacyHealthTipController.js
const HealthTip = require('../models/HealthTip');

// @desc    Get all health tips for the logged-in pharmacy
// @route   GET /api/pharmacy/health-tips
// @access  Private
exports.getPharmacyHealthTips = async (req, res) => {
    try {
        const tips = await HealthTip.find({ pharmacy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: tips });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new health tip for the logged-in pharmacy
// @route   POST /api/pharmacy/health-tips
// @access  Private
exports.createHealthTip = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const tip = await HealthTip.create({
            title,
            content,
            category,
            pharmacy: req.user.id
        });
        res.status(201).json({ success: true, data: tip });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a health tip
// @route   DELETE /api/pharmacy/health-tips/:id
// @access  Private
exports.deleteHealthTip = async (req, res) => {
    try {
        const tip = await HealthTip.findById(req.params.id);

        if (!tip) {
            return res.status(404).json({ success: false, message: 'Health tip not found' });
        }

        // Ensure the pharmacy owns this tip
        if (tip.pharmacy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this tip' });
        }

        await tip.deleteOne();
        res.status(200).json({ success: true, message: 'Health tip removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};