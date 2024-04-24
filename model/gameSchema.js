const mongoose = require("mongoose");
const Host = require("./hostSchema");

const gameSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Game = mongoose.model("Games", gameSchema);

module.exports = Game;
