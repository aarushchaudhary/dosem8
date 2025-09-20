// models/Regulation.js
const mongoose = require('mongoose');

const regulationSchema = new mongoose.Schema({
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
        trim: true,
        enum: ['Dispensing Rules', 'Storage Requirements', 'Record Keeping', 'Drug Scheduling', 'General'] // Example categories
    },
    source: {
        type: String,
        trim: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// **UPDATED PART**
// This creates a text index on the title and content fields.
// It allows you to perform efficient text searches on the collection,
// which is essential for the AI controller to find relevant context.
regulationSchema.index({ title: 'text', content: 'text' });

const Regulation = mongoose.model('Regulation', regulationSchema);

module.exports = Regulation;