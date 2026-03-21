const Feedback = require("../../model/feedbackSchema");
const redis = require("../../config/redis");
const {parseJSON} = require("../../utils/helpers")

const FEEDBACK_ALL_KEY = "feedbacks:all";

const submitFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newFeedback = new Feedback({
      name,
      email,
      message,
    });

    await newFeedback.save();

    await redis.del(FEEDBACK_ALL_KEY);

    res
      .status(201)
      .json({ message: "Feedback submitted successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const getAllFeedbacks = async (req, res) => {
  try {
    const cachedData = await redis.get(FEEDBACK_ALL_KEY);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: "cache",
        feedbacks: parseJSON(cachedData),
      });
    }
    const feedbacks = await Feedback.find().lean();
    await redis.set(FEEDBACK_ALL_KEY, JSON.stringify(feedbacks), {
      ex: 60,
    });
    res.status(200).json({ feedbacks, success: true, source: "db" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedbacks,
};
