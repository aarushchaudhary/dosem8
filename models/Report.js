// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    month: { type: String, required: true }, // e.g., "September 2025"
    adherenceScore: {
        type: Number,
        min: 0,
        max: 100
    },
    healthInsights: {
        type: String,
        trim: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;