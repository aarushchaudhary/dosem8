// controllers/dashboardController.js
const Pharmacy = require('../models/Pharmacy');
const Consultation = require('../models/Consultation'); // Import the Consultation model

// @desc    Get dashboard data for the logged-in pharmacy
// @route   GET /api/dashboard
// @access  Private (requires authentication middleware)
exports.getDashboardData = async (req, res) => {
    try {
        // Fetch the pharmacy's profile information
        const pharmacy = await Pharmacy.findById(req.user.id).select('-password');

        if (!pharmacy) {
            return res.status(404).json({ success: false, message: 'Pharmacy not found' });
        }

        // Fetch all consultations for the pharmacy
        const consultations = await Consultation.find({ pharmacy: req.user.id })
            .populate('patient', 'name')
            .sort({ 'updatedAt': -1 }); // Sort by the most recently updated

        // Filter to find consultations where the last message is from a patient
        const unreadConsultations = consultations.filter(con => {
            if (con.messages.length > 0) {
                const lastMessage = con.messages[con.messages.length - 1];
                return lastMessage.sender === 'patient';
            }
            return false; // Consultations without messages are not considered unread
        }).slice(0, 5); // Limit to the 5 most recent unread conversations

        // Send both pharmacy info and the unread consultations
        res.status(200).json({
            success: true,
            data: {
                pharmacy,
                unreadConsultations
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};