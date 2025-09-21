// controllers/consultationController.js
const Consultation = require('../models/Consultation');

// @desc    Get all open consultations for the logged-in pharmacy
// @route   GET /api/consultations
// @access  Private
exports.getConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find({ pharmacy: req.user.id, status: 'open' })
            .populate('patient', 'name email'); // Get patient name and email
        res.status(200).json({ success: true, data: consultations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reply to a consultation
// @route   POST /api/consultations/:id/reply
// @access  Private
exports.replyToConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Consultation not found' });
        }

        // Ensure the pharmacy owns this consultation
        if (consultation.pharmacy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const newMessage = {
            sender: 'pharmacy',
            text: req.body.text
        };

        consultation.messages.push(newMessage);
        consultation.status = 'in_progress'; // Update status
        await consultation.save();

        res.status(200).json({ success: true, data: consultation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};