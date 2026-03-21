const Booking = require("../../model/bookingSchema");
const GameStation = require("../../model/gsSchema");
const Slot = require("../../model/slotsSchema");
const Payment = require("../../model/paymentSchema");

const getDateRange = (period, customStart, customEnd) => {
  const now = new Date();
  let start, end;

  switch (period) {
    case "today":
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "week":
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      end = new Date();
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case "custom":
      start = new Date(customStart);
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date();
  }

  return { start, end };
};

const getGameStationReport = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { period = "month", startDate, endDate } = req.query;

    const gameStation = await GameStation.findById(stationId);
    if (!gameStation) {
      return res
        .status(404)
        .json({ success: false, message: "Game station not found" });
    }

    const gamePriceMap = {};
    (gameStation.games || []).forEach((g) => {
      gamePriceMap[g.game.toString()] = g.slotPrice || 0;
    });

    const { start, end } = getDateRange(period, startDate, endDate);

    const bookings = await Booking.find({
      gameStationId: stationId,
      createdAt: { $gte: start, $lte: end },
    })
      .populate("game", "name image")
      .populate("userId", "userName email")
      .lean();

    const totalBookings = bookings.length;
    const bookedCount = bookings.filter((b) => b.status === "booked").length;
    const cancelledCount = bookings.filter(
      (b) => b.status === "cancelled",
    ).length;
    const pendingCount = bookings.filter((b) => b.status === "pending").length;

    const totalRevenue = bookings
      .filter((b) => b.status === "booked")
      .reduce((sum, b) => {
        const gameId = b.game?._id?.toString();
        const price = gamePriceMap[gameId] || 0;
        const hours = (b.duration || 60) / 60;
        return sum + price * hours;
      }, 0);

    const gameBookingCount = {};
    bookings.forEach((b) => {
      const name = b.game?.name || "Unknown";
      gameBookingCount[name] = (gameBookingCount[name] || 0) + 1;
    });
    const mostBookedGame =
      Object.entries(gameBookingCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A";

    const bookingsByDay = {};
    bookings.forEach((b) => {
      const day = new Date(b.createdAt).toISOString().split("T")[0];
      bookingsByDay[day] = (bookingsByDay[day] || 0) + 1;
    });

    const totalSlots = await Slot.countDocuments({
      gsid: stationId,
      date: { $gte: start, $lte: end },
    });
    const bookedSlots = await Slot.countDocuments({
      gsid: stationId,
      date: { $gte: start, $lte: end },
      status: "Booked",
    });
    const utilizationRate =
      totalSlots > 0 ? ((bookedSlots / totalSlots) * 100).toFixed(1) : 0;

    return res.status(200).json({
      success: true,
      report: {
        station: {
          id: gameStation._id,
          name: gameStation.name,
          city: gameStation.city,
          status: gameStation.status,
        },
        period: { from: start, to: end, label: period },
        bookings: {
          total: totalBookings,
          booked: bookedCount,
          cancelled: cancelledCount,
          pending: pendingCount,
        },
        revenue: {
          total: totalRevenue,
          currency: "INR",
        },
        slots: {
          total: totalSlots,
          booked: bookedSlots,
          utilizationRate: `${utilizationRate}%`,
        },
        mostBookedGame,
        bookingsByDay,
        recentBookings: bookings.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getHostReport = async (req, res) => {
  try {
    const { hostId } = req.params;
    const { period = "month", startDate, endDate } = req.query;

    const stations = await GameStation.find({ host: hostId }).lean();
    if (!stations.length) {
      return res
        .status(404)
        .json({ success: false, message: "No stations found" });
    }

    const stationPriceMap = {};
    stations.forEach((station) => {
      stationPriceMap[station._id.toString()] = {};
      (station.games || []).forEach((g) => {
        stationPriceMap[station._id.toString()][g.game.toString()] =
          g.slotPrice || 0;
      });
    });

    const { start, end } = getDateRange(period, startDate, endDate);
    const stationIds = stations.map((s) => s._id);

    const bookings = await Booking.find({
      gameStationId: { $in: stationIds },
      createdAt: { $gte: start, $lte: end },
    })
      .populate("game", "name")
      .populate("gameStationId", "name city")
      .lean();

    const stationBreakdown = stations.map((station) => {
      const sid = station._id.toString();
      const priceMap = stationPriceMap[sid] || {};

      const stationBookings = bookings.filter(
        (b) => b.gameStationId?._id?.toString() === sid,
      );

      const revenue = stationBookings
        .filter((b) => b.status === "booked")
        .reduce((sum, b) => {
          const gameId = b.game?._id?.toString();
          const price = priceMap[gameId] || 0;
          const hours = (b.duration || 60) / 60;
          return sum + price * hours;
        }, 0);

      return {
        stationId: station._id,
        name: station.name,
        city: station.city,
        status: station.status,
        bookings: stationBookings.length,
        revenue,
        cancelled: stationBookings.filter((b) => b.status === "cancelled")
          .length,
      };
    });

    const totalRevenue = stationBreakdown.reduce((s, b) => s + b.revenue, 0);
    const totalBookings = stationBreakdown.reduce((s, b) => s + b.bookings, 0);
    const bestStation = [...stationBreakdown].sort(
      (a, b) => b.revenue - a.revenue,
    )[0];

    return res.status(200).json({
      success: true,
      report: {
        hostId,
        period: { from: start, to: end, label: period },
        totalStations: stations.length,
        activeStations: stations.filter((s) => s.status === "Allowed").length,
        totalBookings,
        totalRevenue,
        bestPerforming: bestStation?.name || "N/A",
        stationBreakdown,
      },
    });
  } catch (error) {
    console.error("Host report error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getGamePerformanceReport = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { period = "month", startDate, endDate } = req.query;

    const { start, end } = getDateRange(period, startDate, endDate);

    const bookings = await Booking.find({
      gameStationId: stationId,
      createdAt: { $gte: start, $lte: end },
    })
      .populate("game", "name slotPrice image")
      .lean();

    const gameStats = {};
    bookings.forEach((b) => {
      if (!b.game) return;
      const id = b.game._id.toString();
      if (!gameStats[id]) {
        gameStats[id] = {
          gameId: id,
          name: b.game.name,
          image: b.game.image,
          slotPrice: b.game.slotPrice,
          bookings: 0,
          revenue: 0,
          cancelled: 0,
        };
      }
      gameStats[id].bookings++;
      if (b.paymentStatus === "successfull") {
        gameStats[id].revenue += b.game.slotPrice * (b.duration || 1);
      }
      if (b.status === "cancelled") {
        gameStats[id].cancelled++;
      }
    });

    const games = Object.values(gameStats).sort(
      (a, b) => b.bookings - a.bookings,
    );

    return res.status(200).json({
      success: true,
      report: {
        stationId,
        period: { from: start, to: end, label: period },
        games,
      },
    });
  } catch (error) {
    console.error("Game performance report error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getGameStationReport,
  getHostReport,
  getGamePerformanceReport,
};
