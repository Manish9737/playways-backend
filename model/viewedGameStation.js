const mongoose = require('mongoose');

const viewedGameStationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  gameStationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameStation', 
    required: true
  }
}, { timestamps: true });

const ViewedGameStation = mongoose.model('ViewedGameStation', viewedGameStationSchema);

module.exports = ViewedGameStation;
