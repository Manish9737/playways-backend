const Booking = require("../../model/bookingSchema");
const Slot = require("../../model/slotsSchema");
const GameStation = require("../../model/gsSchema");
const Game = require("../../model/gameSchema");
const Activity = require("../../model/activitySchema");
const {parseJSON} = require("../../utils/helpers")
const redis = require("../../config/redis");

const BOOKINGS_CACHE_KEY = "bookings:all";
const BOOKING_KEY = (id) => `booking:${id}`;
const BOOKINGS_LIST_KEY = (query) => `bookings:list:${JSON.stringify(query)}`;

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

    await redis.del(BOOKINGS_CACHE_KEY);

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
    const cachedData = await redis.get(BOOKINGS_CACHE_KEY);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: "cache",
        bookings: parseJSON(cachedData),
      });
    }

    const bookings = await Booking.find()
      .populate("userId")
      .populate("gameStationId")
      .populate("game")
      .lean();

    await redis.set(BOOKINGS_CACHE_KEY, JSON.stringify(bookings), {
      ex: 60,
    });

    res.status(200).json({ success: true, source: "db", bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10, search } = req.query;

    const queryKey = BOOKINGS_LIST_KEY({ status, paymentStatus, page, limit });

    const cached = await redis.get(queryKey);
    if (cached) {
      return res.json({
        success: true,
        source: "cache",
        ...JSON.parse(cached),
      });
    }

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

    const response = {
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };

    await redis.set(queryKey, JSON.stringify(response), { ex: 60 });

    return res.status(200).json({
      success: true,
      data: bookings,
      ...response,
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

    await redis.del(BOOKING_KEY(bookingId));
    await redis.del(BOOKINGS_CACHE_KEY);

    res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error) {
    console.error("Error canceling booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBookingById = async (req, res) => {
  try {
    const key = BOOKING_KEY(req.params.id);

    const cached = await redis.get(key);

    if (cached) {
      return res.json({
        success: true,
        source: "cache",
        data: JSON.parse(cached),
      });
    }

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

    await redis.set(key, JSON.stringify(booking), { ex: 120 });

    return res.status(200).json({ success: true, source: "db", data: booking });
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

    await redis.del(BOOKING_KEY(bookingId));
    await redis.del(BOOKINGS_CACHE_KEY);

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
