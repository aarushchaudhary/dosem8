// controllers/advertisementController.js
const Advertisement = require('../models/Advertisement');

// @desc    Get all advertisements for the logged-in pharmacy
// @route   GET /api/advertisements
// @access  Private
exports.getAdvertisements = async (req, res) => {
    try {
        const advertisements = await Advertisement.find({ pharmacy: req.user.id });
        res.status(200).json({ success: true, data: advertisements });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new advertisement
// @route   POST /api/advertisements
// @access  Private
exports.createAdvertisement = async (req, res) => {
    try {
        // Associate the advertisement with the logged-in pharmacy
        req.body.pharmacy = req.user.id;
        
        const advertisement = await Advertisement.create(req.body);
        res.status(201).json({ success: true, data: advertisement });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all active advertisements for patients
// @route   GET /api/advertisements/active
// @access  Private
exports.getActiveAdvertisements = async (req, res) => {
    try {
        const advertisements = await Advertisement.find({ status: 'active' })
            .populate('pharmacy', 'pharmacyName'); // Include pharmacy name
        res.status(200).json({ success: true, data: advertisements });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};