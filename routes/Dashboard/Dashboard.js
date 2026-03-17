const router = require("express").Router();
const { getDashboardStats } = require("../../controller/Dashboard/dashboardController");


router.get("/stats", getDashboardStats); 
module.exports = router;