const Booking = require("../../model/bookingSchema");
const Slot = require("../../model/slotsSchema");
const GameStation = require("../../model/gsSchema");
const Game = require("../../model/gameSchema");
const Activity = require("../../model/activitySchema");

const addBooking = async (req, res, next) => {
  const { gameStationId } = req.params;
  const { userId, slotDate, slotTiming, duration, game } = req.body;
  try {
    const newBooking = new Booking({
      userId,
      slotDate,
      slotTiming,
      duration,
      game,
      gameStationId,
      status: "booked",
      paymentStatus: "successfull",
    });

    await newBooking.save();

    res.status(201).json({
      message: "Booking created successfully",
      success: true,
      booking: newBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
};

const allBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("userId")
      .populate("gameStationId")
      .populate("game");

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = Booking.find(filter)
      .populate("userId", "userName email phone")
      .populate("gameStationId", "name city address")
      .populate("game", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const [bookings, total] = await Promise.all([
      query.lean(),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cancelBooking = async (req, res, next) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(booking.slotDate) <= today) {
      return res.status(400).json({
        message:
          "Booking cannot be canceled on the day of the booking or after",
      });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error) {
    console.error("Error canceling booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId", "userName email phone ProfileImg")
      .populate("gameStationId", "name city address phone email gsLogo")
      .populate("game", "name image")
      .lean();

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, adminId } = req.params;
    const { status, paymentStatus } = req.body;

    if (!status && !paymentStatus) {
      return res.status(400).json({
        success: false,
        message:
          "Provide at least one field to update: status or paymentStatus",
      });
    }

    const validStatuses = ["pending", "booked", "cancelled"];
    const validPaymentStatuses = ["pending", "successfull", "failed"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(", ")}`,
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const previousStatus = booking.status;

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();

    if (status === "cancelled" && previousStatus !== "cancelled") {
      await Slot.updateOne(
        { "slots.bookingid": booking._id },
        {
          $set: {
            "slots.$.status": "Available",
            "slots.$.bookingid": null,
            "slots.$.paymentid": null,
          },
        },
      );
    }

    const changes = [];
    if (status) changes.push(`status → ${status}`);
    if (paymentStatus) changes.push(`paymentStatus → ${paymentStatus}`);

    await Activity.create({
      adminId: adminId,
      activityType: `Booking #${bookingId} updated: ${changes.join(", ")}`,
      actionType: "update",
    });

    const updatedBooking = await Booking.findById(bookingId)
      .populate("userId", "userName email phone")
      .populate("gameStationId", "name city")
      .populate("game", "name image")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllBookings,
  addBooking,
  allBookings,
  cancelBooking,
  getBookingById,
  updateBookingStatus,
};
