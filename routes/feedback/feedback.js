const express = require('express');
const { submitFeedback, getAllFeedbacks } = require('../../controller/feedback/feedbackController');
const router = express.Router();

router.post('/submit', submitFeedback);

router.get('/get', getAllFeedbacks); 

module.exports = router;
