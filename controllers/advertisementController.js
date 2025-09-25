// controllers/advertisementController.js
const Advertisement = require('../models/Advertisement');

// @desc    Get all advertisements for the logged-in pharmacy
// @route   GET /api/advertisements
// @access  Private
exports.getAdvertisements = async (req, res) => {
    try {
        const advertisements = await Advertisement.find({ pharmacy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: advertisements });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new advertisement (pending payment)
// @route   POST /api/advertisements
// @access  Private
exports.createAdvertisement = async (req, res) => {
    try {
        const { campaignTitle, content, amount } = req.body;
        
        const advertisement = await Advertisement.create({
            campaignTitle,
            content,
            pharmacy: req.user.id,
            status: 'pending_payment',
            paymentDetails: {
                amount,
                status: 'unpaid'
            }
        });
        res.status(201).json({ success: true, data: advertisement });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    "Process" a dummy payment and activate an ad
// @route   POST /api/advertisements/:id/pay
// @access  Private
exports.processAdPayment = async (req, res) => {
    try {
        const advertisement = await Advertisement.findById(req.params.id);

        if (!advertisement) {
            return res.status(404).json({ success: false, message: 'Advertisement not found' });
        }

        if (advertisement.pharmacy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        advertisement.status = 'active';
        advertisement.paymentDetails.status = 'paid';
        advertisement.paymentDetails.transactionId = `dummy_${new Date().getTime()}`;
        advertisement.startDate = new Date();

        await advertisement.save();

        res.status(200).json({ success: true, data: advertisement });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete an advertisement
// @route   DELETE /api/advertisements/:id
// @access  Private
exports.deleteAdvertisement = async (req, res) => {
    try {
        const advertisement = await Advertisement.findById(req.params.id);

        if (!advertisement) {
            return res.status(404).json({ success: false, message: 'Advertisement not found' });
        }

        if (advertisement.pharmacy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this ad' });
        }

        await advertisement.deleteOne();

        res.status(200).json({ success: true, message: 'Advertisement removed' });
    } catch (error) {
        console.error('Error deleting advertisement:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all active advertisements for patients
// @route   GET /api/advertisements/active
// @access  Private
exports.getActiveAdvertisements = async (req, res) => {
    try {
        const advertisements = await Advertisement.find({ status: 'active' })
            .populate('pharmacy', 'pharmacyName');
        res.status(200).json({ success: true, data: advertisements });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
