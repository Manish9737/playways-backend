const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"],
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isSuperUser: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

// password hasing
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
