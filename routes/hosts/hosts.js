var express = require("express");
var router = express.Router();
const passport = require("passport"); 
const {
  registerHost,
  loginHost,
  getHosts,
  updateHost,
  deleteHost,
  logOut,
  forgotPassword,
  resetPassword,
  fetchOTP,
} = require("../../controller/host/hostController");
// const setupGoogleStrategy = require("../../middlewares/googleStrategy");

require("dotenv").config();
// setupGoogleStrategy(passport);

router.post("/register", registerHost); // register route

router.post("/login", loginHost); // Login route

router.put("/update/:id", updateHost); // Route to update a Host's data

router.delete("/delete/:id", deleteHost); // Route to delete a Host

router.get("/getHosts", getHosts); // Get all hosts

router.get("/logout", logOut); // Logout Host route

router.post("/forgot-password", forgotPassword); // Login route

router.post("/reset-password", resetPassword); // Login route

router.post("/fetchOtp", fetchOTP); // Login route





module.exports = router;
