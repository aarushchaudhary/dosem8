// controllers/pharmacyController.js
const Pharmacy = require('../models/Pharmacy');
const { findNearbyPharmacies } = require('../services/mapsService'); // Import the new service function

// @desc    Get all pharmacies registered in the app
// @route   GET /api/pharmacies
// @access  Private (for patients)
exports.getPharmacies = async (req, res) => {
    try {
        // We only select the pharmacyName and _id to keep the data lightweight
        const pharmacies = await Pharmacy.find().select('pharmacyName');
        res.status(200).json({ success: true, data: pharmacies });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get nearby pharmacies using Google Maps
// @route   GET /api/pharmacies/nearby
// @access  Private (for patients)
exports.getNearbyPharmacies = async (req, res) => {
    try {
        const nearbyData = await findNearbyPharmacies();
        res.status(200).json({ success: true, data: nearbyData });
    } catch (error) {
        console.error('Error fetching nearby pharmacies:', error);
        res.status(500).json({ success: false, message: 'Server Error while fetching nearby pharmacies.' });
    }
};
