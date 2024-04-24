const mongoose = require("mongoose");
const citySchema = require('./citySchema'); // Import the City schema

const stateSchema = new mongoose.Schema({
    stateName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    cities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
    }]
});

const State = mongoose.model('State', stateSchema);
module.exports = State;
    