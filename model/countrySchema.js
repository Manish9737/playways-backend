const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
    countryName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    states: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
    }]
});

const Country = mongoose.model('Country', countrySchema);
module.exports = Country;
