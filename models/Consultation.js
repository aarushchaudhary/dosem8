// models/Consultation.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['patient', 'pharmacy'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const consultationSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    pharmacy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Pharmacy'
    },
    initialQuestion: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'closed'],
        default: 'open'
    },
    messages: [messageSchema], // Array to store the conversation
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;