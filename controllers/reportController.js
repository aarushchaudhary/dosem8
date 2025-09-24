// controllers/reportController.js
const Report = require('../models/Report');

// @desc    Submit a new health report
// @route   POST /api/reports
// @access  Premium
exports.submitHealthReport = async (req, res) => {
    try {
        const { pharmacy, height, weight, age, bloodPressure, pulse, bloodSugar, problemDescription } = req.body;

        const reportData = {
            user: req.user.id,
            pharmacy,
            medicalInfo: { height, weight, age, bloodPressure, pulse, bloodSugar },
            problemDescription
        };

        const report = await Report.create(reportData);
        res.status(201).json({ success: true, data: report });

    } catch (error) {
        console.error('Error submitting health report:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all submitted reports for the logged-in user
// @route   GET /api/reports
// @access  Premium
exports.getSubmittedReports = async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user.id })
            .populate('pharmacy', 'pharmacyName')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
