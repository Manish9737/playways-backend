const mongoose = require("mongoose");
const Host = require("./hostSchema");

const gsSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hosts",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
    },
    gsLogo: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
      trim: true,
    },
    longitude: {
      type: Number,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    openingTime: {
      type: String, 
      // required: true,
    },
    closingTime: {
      type: String, 
      // required: true,
    },
    closedDays: {
      type: [String], 
      default: [], 
    },
    status: {
      type: String,
      enum: ["Allowed", "Pending", "Rejected"],
      default: "Pending",
    },
    viewers: {
      type: Number,
      default: 0,
    },
    games: [
      {
        game: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Games",
          required: true,
        },
        description: {
          type: String,
        },
        slotPrice: { type: Number, default: 0, required: true },
        time: {
          type: Number,
          required: true,
        },
      },
    ],
    images: [{ type: String }],
    videos: [{ type: String }],
  },
  { timestamps: true }
);

const GameStation = mongoose.model("GameStation", gsSchema);

module.exports = GameStation;
