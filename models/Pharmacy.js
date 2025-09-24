// models/Pharmacy.js
const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    pharmacyName: {
        type: String,
        required: [true, 'Pharmacy name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Ensures no two users can have the same email
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'] // Basic email validation
    },
    password: {
        type: String,
        required: [true, 'Password is required']
        // Note: You should hash this password using a library like bcrypt
        // before saving it to the database in your controller.
    },
    address: {
        type: String,
        trim: true
    },
    // --- NEW SECTION FOR PREMIUM FEATURES ---
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'premium'],
            default: 'free'
        },
        expires: {
            type: Date,
            default: null
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

module.exports = Pharmacy;