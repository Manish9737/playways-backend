const mongoose = require("mongoose");

const SlotSchema = new mongoose.Schema({
  gsid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GameStation",
    required: true,
  },
  gameid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Games",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  slots: [
    {
      timefrom: {
        type: String,
        required: true,
      },
      timeto: {
        type: String,
        required: true,
      },
      bookingid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null,
      },
      paymentid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        default: null,
      },
      status: {
        type: String,
        enum: ["Available", "Booked"],
        default: "Available",
      },
    },
  ],
});

const Slot = mongoose.model("Slot", SlotSchema);

module.exports = Slot;