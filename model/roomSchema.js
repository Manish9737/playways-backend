const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  },
  content: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    unique: true,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  }, {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host' 
  }],
  messages: [messageSchema] 
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
