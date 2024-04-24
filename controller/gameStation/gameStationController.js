const Host = require("../../model/hostSchema");
const GameStation = require("../../model/gsSchema");
const Game = require("../../model/gameSchema");
const Booking = require("../../model/bookingSchema");
const Slot = require("../../model/slotsSchema");

const addGameStation = async (req, res, next) => {
  try {
    let imgPath = null;

    if (req.file) {
      const gsLogoFilename = req.file.filename;
      imgPath = `/images/${gsLogoFilename}`;
      console.log(gsLogoFilename);
    }

    const {
      host,
      name,
      email,
      phone,
      city,
      state,
      country,
      latitude,
      longitude,
      address,
    } = req.body;

    if (
      !host ||
      !name ||
      !email ||
      !phone ||
      !city ||
      !state ||
      !country ||
      !latitude ||
      !longitude ||
      !address
    ) {
      return res
        .status(422)
        .json({ error: "Please fill the fields properly.", success: false });
    }

    const GameStations = new GameStation({
      host,
      name,
      email,
      phone,
      gsLogo: imgPath,
      city,
      state,
      country,
      latitude,
      longitude,
      address,
    });

    // console.log(GameStations);
    await GameStations.save();
    console.log("Game Station is added.");
    return res.status(200).json({
      message: "Game Station added successfully.",
      success: true,
      GameStations,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

const getGameStation = async (req, res, next) => {
  const { emailOrPhone } = req.body;

  try {
    let gameStations;

    const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
    if (isEmail) {
      gameStations = await GameStation.find({ email: emailOrPhone }).populate(
        "host",
        "-password -cpassword"
      );
    } else {
      gameStations = await GameStation.find({ phone: emailOrPhone }).populate(
        "host",
        "-password -cpassword"
      );
    }

    if (!gameStations || gameStations.length === 0) {
      return res
        .status(404)
        .json({ message: "Game Stations not found", success: false });
    }

    const gameStationsWithImages = gameStations.map((station) => {
      return {
        _id: station._id,
        host: station.host,
        name: station.name,
        email: station.email,
        phone: station.phone,
        gsLogo: station.gsLogo,
        city: station.city,
        state: station.state,
        country: station.country,
        latitude: station.latitude,
        longitude: station.longitude,
        address: station.address,
        status: station.status,
      };
    });

    return res.status(200).json({
      message: "Game Stations found",
      success: true,
      gameStations: gameStationsWithImages,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const allStations = async (req, res, next) => {
  try {
    const gameStations = await GameStation.find({}).populate("host").populate({
      path: "games.game",
      model: "Games",
    });

    res.status(200).json({ gameStations });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const updateGameStation = async (req, res, next) => {
  const gameStationId = req.params.id;
  const updateData = req.body;

  try {
    const gameStation = await GameStation.findById(gameStationId).catch(
      (error) => {
        console.error("Error in findById:", error);
        throw error;
      }
    );

    if (!gameStation) {
      return res
        .status(404)
        .json({ message: "GameStation not found", success: false });
    }

    if (req.file) {
      const imgFileName = req.file.filename;
      const imgPath = `/images/${imgFileName}`;
      gameStation.gsLogo = imgPath;
    }

    Object.assign(gameStation, updateData);

    await gameStation.save().catch((error) => {
      console.error("Error in saving game station:", error);
      throw error;
    });

    return res.status(200).json({
      message: "GameStation data updated successfully",
      success: true,
      gameStation,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const getAllGsByHostId = async (req, res, next) => {
  const hostId = req.params.id;
  try {
    const host = await Host.findById(hostId);

    if (!host) {
      return res.status(404).json({ error: "Host not found.", success: false });
    }

    const gameStations = await GameStation.find({ host: hostId }).select(
      "-host"
    );

    const gameStationsWithImages = gameStations.map((station) => {
      return {
        _id: station._id,
        name: station.name,
        email: station.email,
        phone: station.phone,
        gsLogo: station.gsLogo,
        city: station.city,
        state: station.state,
        country: station.country,
        latitude: station.latitude,
        longitude: station.longitude,
        address: station.address,
        status: station.status,
      };
    });

    return res
      .status(200)
      .json({ gameStations: gameStationsWithImages, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

const deleteGameStation = async (req, res, next) => {
  const gameStationId = req.params.id;

  try {
    const deletedGameStation = await GameStation.findByIdAndDelete(
      gameStationId
    );

    if (!deletedGameStation) {
      return res
        .status(404)
        .json({ message: "GameStation not found", success: false });
    }

    return res
      .status(200)
      .json({ message: "GameStation deleted successfully", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const addPhotoToGameStation = async (req, res, next) => {
  try {
    const gameStationId = req.params.id;
    const photo = req.file ? req.file.filename : "";
    const photoPath = `/images/${photo}`;

    if (!photo) {
      return res.status(400).json({
        error: "Please upload a photo",
        success: false,
      });
    }

    // Update the game station with the new photo
    const updatedGameStation = await GameStation.findByIdAndUpdate(
      gameStationId,
      { $push: { images: photoPath } },
      { new: true }
    );

    return res.status(200).json({
      message: "Photo uploaded successfully",
      success: true,
      GameStation: updatedGameStation.name,
      images: updatedGameStation.images,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
};

const getGameStationImages = async (req, res, next) => {
  try {
    const gameStationId = req.params.id;

    // Find the game station by ID
    const gameStation = await GameStation.findById(gameStationId);

    if (!gameStation) {
      return res.status(404).json({
        message: "Game station not found",
        success: false,
      });
    }

    // Return the images associated with the game station
    return res.status(200).json({
      images: gameStation.images, // Assuming 'images' is an array field in the GameStation model containing image paths
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
};

const addVideoToGameStation = async (req, res) => {
  try {
    const gameStationId = req.params.id;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({
        error: "Please upload a video file",
        success: false,
      });
    }

    const videoPath = `/videos/${videoFile.filename}`;

    const updatedGameStation = await GameStation.findByIdAndUpdate(
      gameStationId,
      { $push: { videos: videoPath } },
      { new: true }
    );

    return res.status(200).json({
      message: "Video uploaded successfully",
      success: true,
      gameStation: updatedGameStation.name,
      videos: updatedGameStation.videos,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
};

const getGameStationVideos = async (req, res, next) => {
  try {
    const gameStationId = req.params.id;

    // Find the game station by ID
    const gameStation = await GameStation.findById(gameStationId);

    if (!gameStation) {
      return res.status(404).json({
        message: "Game station not found",
        success: false,
      });
    }

    // Return the images associated with the game station
    return res.status(200).json({
      images: gameStation.videos,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
};

const getCountOfStationsById = async (req, res, next) => {
  const hostId = req.params.hostId;

  try {
    const stations = await GameStation.find({ host: hostId });

    let allowedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    stations.forEach((station) => {
      if (station.status === "Allowed") {
        allowedCount++;
      } else if (station.status === "Pending") {
        pendingCount++;
      } else if (station.status === "Rejected") {
        rejectedCount++;
      }
    });

    const totalCount = stations.length;

    res.json({
      allowed: allowedCount,
      pending: pendingCount,
      rejected: rejectedCount,
      total: totalCount,
      stations,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const getGsById = async (req, res, next) => {
  try {
    const gameStationId = req.params.id;
    const gameStation = await GameStation.findById(gameStationId).populate(
      "games.game"
    );

    if (!gameStation) {
      return res.status(404).json({ message: "GameStation not found" });
    }

    res.status(200).json({ gameStation });
  } catch (error) {
    // Handle errors
    console.error("Error fetching GameStation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addGameToGs = async (req, res, next) => {
  try {
    const { gameId, description, slotPrice, time } = req.body;
    const { gameStationId } = req.params;

    const gameStation = await GameStation.findById(gameStationId);
    if (!gameStation) {
      return res.status(404).json({ message: "Game station not found" });
    }

    const existingGame = gameStation.games.find(
      (game) => game.game.toString() === gameId
    );
    if (existingGame) {
      return res
        .status(400)
        .json({ message: "Game already exists in the game station" });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    gameStation.games.push({
      game: gameId,
      description,
      slotPrice,
      time,
    });

    await gameStation.save();

    res.status(201).json({
      message: "Game template added to game station successfully",
      gameStation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateGameInGs = async (req, res, next) => {
  try {
    const { gameId, gameStationId } = req.params;
    const { description, slotPrice, time } = req.body;

    const gameStation = await GameStation.findById(gameStationId);
    if (!gameStation) {
      return res.status(404).json({ message: "Game station not found" });
    }

    const game = gameStation.games.find((game) => game._id.toString() === gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found in the game station" });
    }

    game.description = description;
    game.slotPrice = slotPrice;
    game.time = time;

    await gameStation.save();

    res.status(200).json({
      message: "Game details updated successfully",
      game,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteGameFromGs = async (req, res, next) => {
  try {
    const { gameId, gameStationId } = req.params;

    const gameStation = await GameStation.findById(gameStationId);
    if (!gameStation) {
      return res.status(404).json({ message: "Game station not found" });
    }

    const gameIndex = gameStation.games.findIndex(
      (game) => game._id.toString() === gameId
    );
    if (gameIndex === -1) {
      return res.status(404).json({ message: "Game not found in the game station" });
    }

    gameStation.games.splice(gameIndex, 1);

    await gameStation.save();

    res.status(200).json({
      message: "Game deleted from the game station successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGamesOfGs = async (req, res, next) => {
  const { stationId } = req.params;

  try {
    const gameStation = await GameStation.findById(stationId).populate(
      "games.game"
    );

    if (!gameStation) {
      return res.status(404).json({ message: "GameStation not found" });
    }

    const games = gameStation.games.map((game) => ({
      id: game._id,
      image: game.game.image,
      name: game.game.name,
      timing: game.time,
      description: game.description,
      slotPrice: game.slotPrice,
    }));

    res.status(200).json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getAllBookingsByGsId = async (req, res, next) => {
  const gameStationId = req.params.id;

  try {
    const bookings = await Booking.find({ gameStation: gameStationId })
      .populate("userId", "-password")
      .populate("gameStationId")
      .populate("game");

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        message: "No bookings found for the provided game station ID",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Bookings found",
      success: true,
      bookings: bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
};

const updateOpeningClosingTime = async (req, res, next) => {
  const { id } = req.params;
  const { openingTime, closingTime, closedDays } = req.body;

  try {
    const gameStation = await GameStation.findById(id);

    if (!gameStation) {
      return res
        .status(404)
        .json({ message: "GameStation not found", success: false });
    }

    gameStation.openingTime = openingTime;
    gameStation.closingTime = closingTime;
    gameStation.closedDays = closedDays;

    await gameStation.save();

    return res.status(200).json({
      message: "Opening and closing times updated successfully",
      success: true,
      gameStation,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const getStationSlots = async (req, res) => {
  try {
    const { gsid, date, gameid } = req.params;

    const queryDate = new Date(date);

    const startDate = new Date(
      queryDate.getFullYear(),
      queryDate.getMonth(),
      queryDate.getDate()
    );
    const endDate = new Date(
      queryDate.getFullYear(),
      queryDate.getMonth(),
      queryDate.getDate(),
      23,
      59,
      59
    );

    const slots = await Slot.find({
      gsid,
      gameid,
      date: { $gte: startDate, $lte: endDate },
    });

    res.json({ slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getSlotsbyGsid = async (req, res, next) => {
  const { gsid } = req.params;
  try {
    const slots = await Slot.find({ gsid })
      .populate({
        path: "gameid",
        model: "Games",
      })
      .populate({
        path: "gsid",
        model: "GameStation", 
      });

    res.json({ slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getGameByIdFromGs = async (req, res, next) => {
  const { stationId, gameId } = req.params;

  try {
    const gameStation = await GameStation.findById(stationId).populate(
      "games.game"
    ); // Populate the 'games' field

    if (!gameStation) {
      return res.status(404).json({ message: "GameStation not found" });
    }

    const game = gameStation.games.find(
      (g) => g.game._id.toString() === gameId
    ); // Access the populated game object

    if (!game) {
      return res
        .status(404)
        .json({ message: "Game not found in this GameStation" });
    }

    return res.status(200).json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSlotsByStationIdGameIdDate = async (req, res) => {
  try {
    const { stationId, gameId, date } = req.params;

    const formattedDate = new Date(date).toISOString().split('T')[0];

    const startDate = new Date(formattedDate);
    const endDate = new Date(formattedDate);
    endDate.setHours(23, 59, 59); 

    const slots = await Slot.find({
      gsid: stationId,
      gameid: gameId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (!slots || slots.length === 0) {
      return res.status(404).json({ message: "No slots found for the provided parameters" });
    }

    res.json({ slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  addGameStation,
  getGameStation,
  allStations,
  addPhotoToGameStation,
  addVideoToGameStation,
  getGameStationImages,
  getGameStationVideos,
  updateGameStation,
  deleteGameStation,
  getAllGsByHostId,
  getCountOfStationsById,
  getGsById,
  addGameToGs,
  updateGameInGs,
  deleteGameFromGs,
  getGamesOfGs,
  getAllBookingsByGsId,
  updateOpeningClosingTime,
  getStationSlots,
  getSlotsbyGsid,
  getGameByIdFromGs,
  getSlotsByStationIdGameIdDate
};
