const express = require("express");
const {
  addBooking,
  allBookings,
  cancelBooking,
  getBookingById,
  updateBookingStatus,
} = require("../../controller/bookings/bookingsController");
const router = express.Router();

router.post("/:gameStationId/addBooking", addBooking);
router.get("/allBookings", allBookings);
router.delete("/:bookingId/cancel", cancelBooking);
router.get("/:bookingId", getBookingById);
// router.put("/:bookingId/updateStatus", updateBookingStatus); 

module.exports = router;
