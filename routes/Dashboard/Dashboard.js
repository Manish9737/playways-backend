const router = require("express").Router();
const { getDashboardStats } = require("../../controller/Dashboard/dashboardController");


router.get("/stats", getDashboardStats); // Get dashboard stats
module.exports = router;