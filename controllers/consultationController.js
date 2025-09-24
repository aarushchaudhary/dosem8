// controllers/consultationController.js
const Consultation = require('../models/Consultation');

// @desc    Get all consultations for the logged-in pharmacy
// @route   GET /api/consultations
// @access  Private (Pharmacy)
exports.getConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find({ pharmacy: req.user.id })
            .populate('patient', 'name email') // Get patient details
            .sort({ createdAt: -1 }); // Show newest first
        res.status(200).json({ success: true, data: consultations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all consultations for the logged-in patient
// @route   GET /api/consultations/patient
// @access  Private (Patient)
exports.getPatientConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find({ patient: req.user.id })
            .populate('pharmacy', 'pharmacyName') // Get pharmacy details
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: consultations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single consultation by ID (for chat view)
// @route   GET /api/consultations/:id
// @access  Private (Patient or Pharmacy)
exports.getConsultationById = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id)
            .populate('patient', 'name')
            .populate('pharmacy', 'pharmacyName');

        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Consultation not found' });
        }

        // Security check: only allow access if the user is part of the conversation
        const isPharmacy = consultation.pharmacy._id.toString() === req.user.id;
        const isPatient = consultation.patient._id.toString() === req.user.id;

        if (!isPharmacy && !isPatient) {
            return res.status(401).json({ success: false, message: 'Not authorized to view this consultation' });
        }

        res.status(200).json({ success: true, data: consultation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new consultation
// @route   POST /api/consultations/patient
// @access  Private (Patient)
exports.createConsultation = async (req, res) => {
    try {
        const { pharmacyId, initialQuestion } = req.body;

        // Create the new consultation
        const consultation = await Consultation.create({
            patient: req.user.id,
            pharmacy: pharmacyId,
            initialQuestion,
            messages: [{ // Add the first message to the conversation
                sender: 'patient',
                text: initialQuestion
            }]
        });
        res.status(201).json({ success: true, data: consultation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reply to a consultation
// @route   POST /api/consultations/:id/reply
// @access  Private (Patient or Pharmacy)
exports.replyToConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Consultation not found' });
        }

        // Check if the logged-in user is the patient or the pharmacy in this consultation
        const isPharmacy = consultation.pharmacy.toString() === req.user.id;
        const isPatient = consultation.patient.toString() === req.user.id;

        if (!isPharmacy && !isPatient) {
            return res.status(401).json({ success: false, message: 'Not authorized to reply to this consultation' });
        }

        const senderType = isPharmacy ? 'pharmacy' : 'patient';

        const newMessage = {
            sender: senderType,
            text: req.body.text
        };

        consultation.messages.push(newMessage);
        consultation.status = 'in_progress'; // Mark as in progress
        await consultation.save();

        res.status(200).json({ success: true, data: consultation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};