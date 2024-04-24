const Game = require("../../model/gameSchema");

const addGame = async (req, res, next) => {
  try {
    const { name, type, timing, description, slotPrice } = req.body;
    const image = req.file ? req.file.filename : "";
    const imgPath = `/images/${image}`;

    const newGame = new Game({
      image: imgPath,
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
      const filePath = req.file.filename;
      console.log(filePath)
      const path = `/images/${filePath}`
      updateData.image = path;
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
    await Game.findByIdAndDelete(id);
    res.status(200).json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addGame,
  allGames,
  updateGame,
  deleteGame,
};
