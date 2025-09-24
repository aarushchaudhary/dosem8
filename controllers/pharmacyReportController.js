// controllers/pharmacyReportController.js
const Report = require('../models/Report');

// @desc    Get all health reports submitted to the logged-in pharmacy
// @route   GET /api/pharmacy-reports
// @access  Private (Pharmacy)
exports.getPatientHealthReports = async (req, res) => {
    try {
        const reports = await Report.find({ pharmacy: req.user.id })
            .populate('user', 'name email') // Get patient details
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching patient reports:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Generate a report by updating a submission
// @route   POST /api/pharmacy-reports/:id/generate
// @access  Private (Pharmacy)
exports.generatePharmacistReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Ensure the pharmacy owns this report
        if (report.pharmacy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const { pharmacistReport } = req.body;
        if (!pharmacistReport) {
            return res.status(400).json({ success: false, message: 'Pharmacist report text is required' });
        }

        report.pharmacistReport = pharmacistReport;
        report.status = 'Completed';
        await report.save();

        res.status(200).json({ success: true, data: report });

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
