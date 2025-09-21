// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    pharmacy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Pharmacy'
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['regulatory', 'system', 'consultation', 'advertisement'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String, // Optional link to the relevant page (e.g., /consultations/123)
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;