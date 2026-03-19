var express = require("express");
var router = express.Router();
const upload = require("../../middlewares/singleFileUpload");
const {
  registerUser,
  loginUser,
  deleteUser,
  allUsers,
  uploadImg,
  forgotPassword,
  resetPassword,
  userDetails,
  updateProfile,
  fetchOTP,
  contactUs,
  findGameStationById,
  getAllBookingsByUserId,
  getGamesOfGs,
} = require("../../controller/users/userController");
const {
  refreshUserToken,
  logoutUser,
} = require("../../controller/auth/refreshController");
const { authenticateUser } = require("../../middlewares/Auth");

require("dotenv").config();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/fetchOtp", fetchOTP);
router.post("/contactUs", contactUs);

router.get("/details/:id", authenticateUser, userDetails);
router.put(
  "/update/:id",
  authenticateUser,
  upload("images").single("ProfileImg"),
  updateProfile,
);
router.delete("/delete/:id", authenticateUser, deleteUser);
router.get("/allUsers", authenticateUser, allUsers);
router.get("/:userId/gameStation/:id/", authenticateUser, findGameStationById);
router.get("/:userId/bookings", authenticateUser, getAllBookingsByUserId);
router.get("/:stationId/games", authenticateUser, getGamesOfGs);

router.post("/refresh-token", refreshUserToken);
router.post("/logout", logoutUser);

module.exports = router;
