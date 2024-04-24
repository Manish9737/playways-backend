const express = require('express');
const { submitFeedback, getAllFeedbacks } = require('../../controller/feedback/feedbackController');
const router = express.Router();

router.post('/submit', submitFeedback); // Route for sending feedback

router.get('/get', getAllFeedbacks);    // Route for getting all feedbacks

module.exports = router;
