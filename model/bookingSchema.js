const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slotDate: {
      type: String,
      required: true,
    },
    slotTiming: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    gameStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameStation",
      required: true,
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Games",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "booked", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "successfull", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
