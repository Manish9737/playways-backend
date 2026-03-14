const express = require("express");
const {
  addBooking,
  allBookings,
  cancelBooking,
  getBookingById,
  updateBookingStatus,
} = require("../../controller/bookings/bookingsController");
const router = express.Router();

router.post("/:gameStationId/addBooking", addBooking); // add Booking
router.get("/allBookings", allBookings); // get all booking
router.delete("/:bookingId/cancel", cancelBooking); // cancel booking
router.get("/:bookingId", getBookingById); // get booking by id
router.put("/:bookingId/updateStatus", updateBookingStatus); // update booking status

module.exports = router;
