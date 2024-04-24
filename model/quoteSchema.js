const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true
    },
    quote:{
        type:String,
        required: true,
        trim: true
    }
})


const Qoute = mongoose.model('Qoutes', quoteSchema);

module.exports = Qoute;