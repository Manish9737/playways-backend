const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    activityType: {
      type: String,
      required: true,
    },
    actionType: {
      type: String,
      enum: ["add", "update", "delete", "other"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activities", activitySchema);

module.exports = Activity;
