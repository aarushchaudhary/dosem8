// models/HealthTip.js
const mongoose = require('mongoose');

const healthTipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        unique: true
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
    imageUrl: {
        type: String,
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