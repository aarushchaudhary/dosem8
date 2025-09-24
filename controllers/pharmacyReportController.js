// controllers/pharmacyReportController.js
const Consultation = require('../models/Consultation');
const Advertisement = require('../models/Advertisement');
const HealthTip = require('../models/HealthTip');

// @desc    Generate and get a business report for the logged-in pharmacy
// @route   GET /api/pharmacy-reports
// @access  Premium Pharmacy
exports.getPharmacyReport = async (req, res) => {
    try {
        const pharmacyId = req.user.id;

        // Aggregate data for the report
        const totalConsultations = await Consultation.countDocuments({ pharmacy: pharmacyId });
        const totalHealthTips = await HealthTip.countDocuments({ pharmacy: pharmacyId });
        
        // Aggregate advertisement performance
        const adPerformance = await Advertisement.aggregate([
            { $match: { pharmacy: new require('mongoose').Types.ObjectId(pharmacyId) } },
            {
                $group: {
                    _id: null,
                    totalCampaigns: { $sum: 1 },
                    totalClicks: { $sum: '$performance.clicks' },
                    totalViews: { $sum: '$performance.views' }
                }
            }
        ]);

        const reportData = {
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            consultationCount: totalConsultations,
            healthTipCount: totalHealthTips,
            advertisementStats: adPerformance[0] || { totalCampaigns: 0, totalClicks: 0, totalViews: 0 }
        };

        res.status(200).json({ success: true, data: reportData });

    } catch (error) {
        console.error('Error generating pharmacy report:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};