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
        // Remember to hash this password with bcryptjs in your auth controller
        // before saving it to the database.
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;