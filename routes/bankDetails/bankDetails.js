var express = require("express");
const { addBankDetails, getBankDetails } = require("../../controller/bankDetails/bankDetailsController");
var router = express.Router();

router.post("/:gsId/bankDetails", addBankDetails);

router.get("/:gsId/bankDetails", getBankDetails);

module.exports = router;