const Booking = require("../../model/bookingSchema");
const User = require("../../model/userSchema");
const GameStation = require("../../model/gsSchema");
const Game = require("../../model/gameSchema");
const Payment = require("../../model/paymentSchema");
const Activity = require("../../model/activitySchema");

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // ── Users ──────────────────────────────────────────────────────────────
    const [totalUsers, newUsersToday, primeUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
      User.countDocuments({ IsPrimeUser: true }),
    ]);

    // ── Game Stations ──────────────────────────────────────────────────────
    const [totalGS, allowedGS, pendingGS, rejectedGS] = await Promise.all([
      GameStation.countDocuments(),
      GameStation.countDocuments({ status: "Allowed" }),
      GameStation.countDocuments({ status: "Pending" }),
      GameStation.countDocuments({ status: "Rejected" }),
    ]);

    // ── Bookings ───────────────────────────────────────────────────────────
    const [
      totalBookings,
      pendingBookings,
      bookedBookings,
      cancelledBookings,
      todayBookings,
      thisMonthBookings,
      lastMonthBookings,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "booked" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
      Booking.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Booking.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);

    // ── Revenue ────────────────────────────────────────────────────────────
    const [totalRevenueData, todayRevenueData, thisMonthRevenueData] = await Promise.all([
      Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { status: "success", createdAt: { $gte: todayStart, $lt: todayEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { status: "success", createdAt: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalRevenue = totalRevenueData[0]?.total || 0;
    const todayRevenue = todayRevenueData[0]?.total || 0;
    const thisMonthRevenue = thisMonthRevenueData[0]?.total || 0;

    // ── Top Game Stations by bookings ──────────────────────────────────────
    const topGameStations = await Booking.aggregate([
      { $match: { status: "booked" } },
      { $group: { _id: "$gameStationId", totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "gamestations",
          localField: "_id",
          foreignField: "_id",
          as: "gsInfo",
        },
      },
      { $unwind: "$gsInfo" },
      {
        $project: {
          _id: 1,
          totalBookings: 1,
          name: "$gsInfo.name",
          city: "$gsInfo.city",
          gsLogo: "$gsInfo.gsLogo",
        },
      },
    ]);

    // ── Top Games by bookings ──────────────────────────────────────────────
    const topGames = await Booking.aggregate([
      { $match: { status: "booked" } },
      { $group: { _id: "$game", totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "games",
          localField: "_id",
          foreignField: "_id",
          as: "gameInfo",
        },
      },
      { $unwind: "$gameInfo" },
      {
        $project: {
          _id: 1,
          totalBookings: 1,
          name: "$gameInfo.name",
          image: "$gameInfo.image",
        },
      },
    ]);

    // ── Monthly booking trend (last 6 months) ─────────────────────────────
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrend = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          bookings: { $sum: 1 },
          revenue: { $sum: 0 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          bookings: 1,
        },
      },
    ]);

    // ── Recent bookings ────────────────────────────────────────────────────
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "userName email phone")
      .populate("gameStationId", "name city")
      .populate("game", "name image")
      .lean();

    // ── Recent activities ──────────────────────────────────────────────────
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("adminId", "userName email")
      .lean();

    // ── Booking status breakdown for chart ────────────────────────────────
    const bookingStatusBreakdown = [
      { status: "pending", count: pendingBookings },
      { status: "booked", count: bookedBookings },
      { status: "cancelled", count: cancelledBookings },
    ];

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          primeUsers,
        },
        gameStations: {
          total: totalGS,
          allowed: allowedGS,
          pending: pendingGS,
          rejected: rejectedGS,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          booked: bookedBookings,
          cancelled: cancelledBookings,
          today: todayBookings,
          thisMonth: thisMonthBookings,
          lastMonth: lastMonthBookings,
          statusBreakdown: bookingStatusBreakdown,
        },
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
          thisMonth: thisMonthRevenue,
        },
        topGameStations,
        topGames,
        monthlyTrend,
        recentBookings,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

module.exports = { getDashboardStats };