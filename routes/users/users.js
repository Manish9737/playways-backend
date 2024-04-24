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

require("dotenv").config();


router.post("/register", registerUser); 
router.post("/login", loginUser); 
router.get("/details/:id", userDetails); 
router.put("/update/:id", upload("images").single("ProfileImg"), updateProfile); 
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password", resetPassword); 
router.post("/fetchOtp", fetchOTP); 
router.delete("/delete/:id", deleteUser); 
router.get("/allUsers", allUsers); 
router.post("/contactUs", contactUs); 
router.get("/:userId/gameStation/:id/", findGameStationById); 
router.get("/:userId/bookings", getAllBookingsByUserId); 
router.get("/:stationId/games", getGamesOfGs); 




module.exports = router;
