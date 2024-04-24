var express = require("express");
const { paymentVerification, createRazorpayOrder, allPayments } = require("../../controller/payment/paymentController");
var router = express.Router();

router.post("/createOrder", createRazorpayOrder)

router.post("/paymentVerification", paymentVerification)

router.get("/all", allPayments)

router.get("/:gsId", allPayments)

module.exports = router;