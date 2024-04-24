var express = require("express");
var router = express.Router();
const {
  addQuotes,
  getallQuotes,
  updateQuote,
  deleteQuote,
} = require('../../controller/quote/quoteController');

require("dotenv").config();

router.post("/add", addQuotes); 
router.get('/getQuotes', getallQuotes); 
router.put('/update/:id', updateQuote); 
router.delete('/delete/:id', deleteQuote); 


module.exports = router;
