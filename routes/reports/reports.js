const express = require("express");
const router = express.Router();
const {
  getGameStationReport,
  getHostReport,
  getGamePerformanceReport,
} = require("../../controller/reports/reportsController");
const { authenticateHost } = require("../../middlewares/Auth");

router.use(authenticateHost);

router.get("/station/:stationId", getGameStationReport);

router.get("/host/:hostId", getHostReport);

router.get("/station/:stationId/games", getGamePerformanceReport);

module.exports = router;
