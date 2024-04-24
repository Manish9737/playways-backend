const Room = require('../model/roomSchema');

async function createRoom(roomId, userId, hostId) {
  try {
    const newRoom = new Room({
      roomId: roomId,
      participants: [userId, hostId],
      messages: []
    });

    await newRoom.save();
    return newRoom;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

async function sendMessage(roomId, senderId, messageContent) {
  try {
    const room = await Room.findOne({ roomId: roomId });

    if (!room) {
      throw new Error('Room not found');
    }

    room.messages.push({
      sender: senderId,
      content: messageContent
    });

    await room.save();
    return room;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

module.exports = { createRoom, sendMessage };
