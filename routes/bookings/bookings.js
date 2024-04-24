const express = require("express");
const {
  addBooking,
  allBookings,
  cancelBooking,
} = require("../../controller/bookings/bookingsController");
const router = express.Router();

router.post("/:gameStationId/addBooking", addBooking); // add Booking
router.get("/allBookings", allBookings); // get all booking
router.delete("/:bookingId/cancel", cancelBooking); // cancel booking

module.exports = router;
