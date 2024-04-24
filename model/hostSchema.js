const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const hostSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"],
      trim: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    resetPasswordOTP: {
      type: String,
    },
  },
  { timestamps: true }
);

// password hasing
hostSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const Host = mongoose.model("Hosts", hostSchema);

module.exports = Host;
