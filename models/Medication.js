// models/Medication.js
const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // This creates a reference to the User model
    },
    medicationName: {
        type: String,
        required: [true, 'Medication name is required'],
        trim: true
    },
    dosage: {
        type: String,
        trim: true,
        default: ''
    },
    schedule: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'as_needed'],
            required: true
        },
        times: [String], // e.g., ["08:00", "14:00", "20:00"]
        notes: {
            type: String,
            trim: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;