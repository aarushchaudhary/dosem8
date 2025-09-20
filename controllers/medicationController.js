// controllers/medicationController.js
const Medication = require('../models/Medication');

// @desc    Get all medications for the logged-in user
// @route   GET /api/medications
// @access  Private
exports.getUserMedications = async (req, res) => {
    try {
        const medications = await Medication.find({ user: req.user.id });
        res.status(200).json({ success: true, count: medications.length, data: medications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add a new medication for the logged-in user
// @route   POST /api/medications
// @access  Private
exports.addMedication = async (req, res) => {
    try {
        // Add the user's ID to the request body before creating the medication
        req.body.user = req.user.id;
        
        const medication = await Medication.create(req.body);
        res.status(201).json({ success: true, data: medication });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a medication for the logged-in user
// @route   PUT /api/medications/:id
// @access  Private
exports.updateMedication = async (req, res) => {
    try {
        let medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({ success: false, message: 'Medication not found' });
        }

        // Make sure the logged-in user owns the medication
        if (medication.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        medication = await Medication.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: medication });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a medication for the logged-in user
// @route   DELETE /api/medications/:id
// @access  Private
exports.deleteMedication = async (req, res) => {
    try {
        let medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({ success: false, message: 'Medication not found' });
        }

        // Make sure the logged-in user owns the medication
        if (medication.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await medication.deleteOne();

        res.status(200).json({ success: true, message: 'Medication removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};