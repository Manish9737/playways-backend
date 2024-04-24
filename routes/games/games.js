const express = require("express");
const {
  addGame,
  allGames,
  deleteGame,
  updateGame,
} = require("../../controller/games/gamesController");
const router = express.Router();
const upload = require("../../middlewares/singleFileUpload");

router.post("/addGame", upload("images").single("image"), addGame);
router.get("/all", allGames);
router.put("/update/:id", upload('images').single('image'), updateGame);
router.delete("/delete/:id", deleteGame);

module.exports = router;