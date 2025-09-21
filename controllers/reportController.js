// controllers/reportController.js
const Report = require('../models/Report');
const Medication = require('../models/Medication');

// @desc    Generate and get a health report for the logged-in user
// @route   GET /api/reports
// @access  Premium
exports.getHealthReport = async (req, res) => {
    try {
        // In a real app, this logic would be much more complex, analyzing logs of when
        // a user marked their medication as "taken".
        // For this example, we'll generate a placeholder report based on their number of medications.

        const medicationCount = await Medication.countDocuments({ user: req.user.id });
        const adherenceScore = Math.max(0, 100 - (medicationCount * 5)); // Placeholder calculation
        const insight = medicationCount > 3 
            ? "Managing multiple medications can be challenging. Great job staying on top of it! Consider setting specific alarms for each." 
            : "You're doing well with your current medication schedule. Keep up the consistent effort!";
        
        const report = {
            user: req.user.id,
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            adherenceScore,
            healthInsights: insight
        };

        // You could save this report to the database here if you wish
        // await Report.create(report);

        res.status(200).json({ success: true, data: report });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};