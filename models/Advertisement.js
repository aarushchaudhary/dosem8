// models/Advertisement.js
const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
    pharmacy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Pharmacy' // Link to the pharmacy that created the ad
    },
    campaignTitle: {
        type: String,
        required: [true, 'Campaign title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Ad content is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'pending_payment', 'expired'],
        default: 'pending_payment'
    },
    performance: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 }
    },
    paymentDetails: {
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['paid', 'unpaid'],
            default: 'unpaid'
        },
        transactionId: { type: String }
    },
    startDate: { type: Date },
    endDate: { type: Date },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

module.exports = Advertisement;