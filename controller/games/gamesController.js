const uploadImage = require("../../utils/uploadImage");
const Game = require("../../model/gameSchema");
const deleteCloudinaryImage = require("../../utils/deleteCloudinaryImage");

const addGame = async (req, res, next) => {
  try {
    const { name, type, timing, description, slotPrice } = req.body;

    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadImage(req.file, "games");
    }

    const newGame = new Game({
      image: imageUrl,
      name,
      type,
      timing,
      description,
      slotPrice,
    });

    await newGame.save();

    res.status(201).json({
      message: "Game added successfully",
      game: newGame,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const allGames = async (req, res, next) => {
  try {
    const games = await Game.find();
    res.status(200).json({ games });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateGame = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const game = await Game.findById(id);

    if (!game) {
      return res
        .status(404)
        .json({ message: "Game not found", success: false });
    }

    if (req.file) {
      const imageUrl = await uploadImage(req.file, "games");
      updateData.image = imageUrl;
    }

    Object.assign(game, updateData);

    await game.save();

    res
      .status(200)
      .json({ message: "Game updated successfully", success: true, game });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};

const deleteGame = async (req, res, next) => {
  const { id } = req.params;
  try {
    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({
        message: "Game not found",
        success: false,
      });
    }

    await deleteCloudinaryImage(game.image);

    await Game.findByIdAndDelete(id);
    res.status(200).json({ message: "Game deleted successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};

module.exports = {
  addGame,
  allGames,
  updateGame,
  deleteGame,
};
