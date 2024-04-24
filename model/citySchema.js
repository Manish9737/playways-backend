const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
    cityName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    }
});

const City = mongoose.model('City', citySchema);
module.exports = City;  