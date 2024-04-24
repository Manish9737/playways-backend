const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Feedback Schema
const feedbackSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a model based on the schema
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
