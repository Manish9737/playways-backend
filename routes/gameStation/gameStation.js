var express = require("express");
var router = express.Router();
const Host = require("../../model/hostSchema");
const GameStation = require("../../model/gsSchema");
const upload = require("../../middlewares/singleFileUpload");
// const uploadV = require("../../middlewares/singleFileUploadV");
const {
  addGameStation,
  getGameStation,
  allStations,
  updateGameStation,
  getAllGsByHostId,
  deleteGameStation,
  addPhotoToGameStation,
  getGameStationImages,
  addVideoToGameStation,
  getGameStationVideos,
  getCountOfStationsById,
  getGsById,
  addGameToGs,
  getGamesOfGs,
  getAllBookingsByGsId,
  updateOpeningClosingTime,
  getStationSlots,
  getSlotsbyGsid,
  getGameByIdFromGs,
  getSlotsByStationIdGameIdDate,
  updateGameInGs,
  deleteGameFromGs,
  // generateGameSlots,
} = require("../../controller/gameStation/gameStationController");

require("dotenv").config();
// require("../../DB/conn");

router.post("/addGameStation", upload("images").single("gsLogo"), addGameStation); // Add GameStations Route

router.post("/getGameStation", getGameStation); // Get all GameStations route

router.get("/allStations", allStations); // get all stations

router.put("/updateGameStation/:id", upload("images").single("gsLogo"), updateGameStation); // Route to update a Host's data

router.delete("/gameStation/:id", deleteGameStation); // Delete the GameStation

router.get("/getallstationbyhostId/:id", getAllGsByHostId); //Get all GS from HostId

router.get("/:id", getGsById); //Get GS from id

router.post("/:id/Media", upload("images").single("photo"), addPhotoToGameStation); // Upload photo of gameStations

router.get("/:id/Media", getGameStationImages); //  Get photo of gameStations

router.post("/:id/Video", upload("videos").single("videoFile"), addVideoToGameStation); // Upload Video of gameStations

router.get("/:id/Video", getGameStationVideos); // Get Video of gameStations

router.get("/:hostId/stations", getCountOfStationsById);  // get all stations by hostId

router.post("/addGame/:gameStationId", addGameToGs);  // add games to gs

router.put('/:gameStationId/updateGame/:gameId', updateGameInGs);  // update games to gs

router.delete('/:gameStationId/deleteGame/:gameId', deleteGameFromGs);  // delete games to gs

router.get("/:stationId/games", getGamesOfGs);  // get all games associated with gs

// router.get("/:stationId/games", getGamesOfGs);  // get all games associated with gs

router.get("/:stationId/bookings", getAllBookingsByGsId);  // get all games associated with gs

router.put("/timing/:id", updateOpeningClosingTime); // Route to update a gs timeopening and closing or closed days

router.get("/:gsid/slots/:gameid/:date", getStationSlots);  // get all slots of gs with date

router.get("/:gsid/slots", getSlotsbyGsid);  // get slot by gsid

router.get("/:stationId/:gameId/game", getGameByIdFromGs);  // get game data by gsid, gameId

router.get("/:stationId/:gameId/:date/slots", getSlotsByStationIdGameIdDate);  // get game data by gsid, gameId


module.exports = router;  

// router.use("/images", express.static("public/images")); // route for get gsLogo
