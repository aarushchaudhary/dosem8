// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    pharmacy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Pharmacy'
    },
    medicalInfo: {
        height: { type: String, required: true },
        weight: { type: String, required: true },
        age: { type: Number, required: true },
        bloodPressure: { type: String },
        pulse: { type: String },
        bloodSugar: { type: String }
    },
    problemDescription: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    pharmacistReport: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;