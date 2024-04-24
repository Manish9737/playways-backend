const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      // unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"],
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    ProfileImg: {
      type: String,
    },
    IsPrimeUser: {
      type: Boolean,
      default: false,
    },
    resetPasswordOTP: {
      type: String,
    },
  },
  { timestamps: true }
);

// password hasing
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
