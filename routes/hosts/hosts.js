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
const {
  logoutHost,
  refreshHostToken,
} = require("../../controller/auth/refreshController");
const { authenticateHost } = require("../../middlewares/Auth");

require("dotenv").config();

router.post("/register", registerHost); // register route
router.post("/login", loginHost); // Login route
router.post("/forgot-password", forgotPassword); // Login route
router.post("/reset-password", resetPassword); // Login route
router.post("/fetchOtp", fetchOTP); // Login route

router.get("/getHosts", authenticateHost, getHosts); // Get all hosts
router.put("/update/:id", authenticateHost, updateHost); // Route to update a Host's data
router.delete("/delete/:id", authenticateHost, deleteHost); // Route to delete a Host

router.post("/refresh-token", refreshHostToken);
router.post("/logout", logoutHost);

module.exports = router;
