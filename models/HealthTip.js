// models/HealthTip.js
const mongoose = require('mongoose');

const healthTipSchema = new mongoose.Schema({
    pharmacy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a text index to allow searching on title and content
healthTipSchema.index({ title: 'text', content: 'text' });

const HealthTip = mongoose.model('HealthTip', healthTipSchema);

module.exports = HealthTip;