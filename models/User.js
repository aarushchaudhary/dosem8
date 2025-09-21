// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'] // Basic email format validation
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    profileInfo: {
        dateOfBirth: { type: Date },
        address: { type: String, trim: true }
    },
    settings: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        }
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

const User = mongoose.model('User', userSchema);

module.exports = User;