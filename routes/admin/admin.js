var express = require("express");
var router = express.Router();
const {
  addCountry,
  updateCountry,
  addCities,
  getAllData,
  getCountries,
  getStates,
  getCities,
} = require("../../controller/country/countryController");
const {
  registerAdmin,
  loginAdmin,
  deleteAdmin,
  allAdmins,
  adminDetails,
  sendEmailbyAdmin,
  addAdmin,
  changePassword,
  getRecentActivities,

  allUsers,
  AddUser,
  updateUser,
  deleteUser,

  allQuotes,
  addQuote,
  updateQuote,
  deleteQuote,

  allGames,
  addGame,
  updateGame,
  deleteGame,

  allHosts,
  addHost,
  updateHost,
  deleteHost,

  allGameStations,
  addGameStation,
  updateGameStation,
  deleteGameStation,
  getCountOfStationsById,
  getAllGsByHostId,
  getGsById,
} = require("../../controller/admin/adminController");
const { checkSuperUser } = require("../../middlewares/adminAuth");
const upload = require("../../middlewares/singleFileUpload");
const { getAllBlogs, createBlog, updateBlog, deleteBlog } = require("../../controller/Blog/blogsContoller");

router.post("/register", registerAdmin); // Register new Admin
router.post("/login", loginAdmin); // Login Admin
router.get("/admins", allAdmins); // all Admin
router.post("/:adminId/addAdmin", addAdmin); // Add new Admin
router.post("/:adminId/changePassword", changePassword); // change Admin pass
router.get(`/:adminId/details`, adminDetails);
router.get("/:adminId/activities", getRecentActivities);
router.post("/:adminId/sendEmail", sendEmailbyAdmin);
router.delete("/:adminId/delete/:id", checkSuperUser, deleteAdmin);

router.post("/addCountry", addCountry);
router.post("/addCities", addCities);
router.post("/updateCountry/:id", updateCountry);
router.get("/getAllCountry", getAllData);
router.get("/getCountry", getCountries);
router.get("/getStates", getStates);
router.get("/getCities", getCities);

router.get("/users", allUsers);
router.post("/users/:adminId/add", checkSuperUser, AddUser);
router.put("/users/:adminId/update/:id", upload("images").single("ProfileImg"), updateUser);
router.delete("/users/:adminId/delete/:id", checkSuperUser, deleteUser);

router.get("/quotes", allQuotes);
router.post("/quotes/:adminId/add", addQuote);
router.put("/quotes/:adminId/update/:id", updateQuote);
router.delete("/quotes/:adminId/delete/:id", deleteQuote);

router.get("/games", allGames);
router.post("/games/:adminId/add",upload("images").single("image"), addGame);
router.put("/games/:adminId/update/:id", updateGame);
router.delete("/games/:adminId/delete/:id", deleteGame);

router.get("/hosts", allHosts);
router.post("/hosts/:adminId/add", checkSuperUser, addHost);
router.put("/hosts/:adminId/update/:hostId", updateHost);
router.delete("/hosts/:adminId/delete/:hostId", checkSuperUser, deleteHost);

router.get("/blogs", getAllBlogs);
router.post("/blogs/:adminId/add", upload("images").single("image"),createBlog);
router.put("/blogs/:adminId/update/:id", upload("images").single("image"), updateBlog);
router.delete("/blogs/:adminId/delete/:id", deleteBlog);

router.get("/gameStations", allGameStations);
router.post("/gameStations/:adminId/add",upload("images").single("gsLogo"), addGameStation);
router.put("/gameStations/:adminId/update/:id", upload("images").single("gsLogo"), updateGameStation);
router.delete("/gameStations/:adminId/delete/:id", deleteGameStation);
router.get("/gameStations/:id/stations", getCountOfStationsById);
router.get("/gameStations/getallstationbyhostId/:id", getAllGsByHostId);
router.get("/gameStations/:id", getGsById);

module.exports = router;
