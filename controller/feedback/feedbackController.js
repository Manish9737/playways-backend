const Feedback = require("../../model/feedbackSchema");

const submitFeedback = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        const newFeedback = new Feedback({
            name,
            email,
            message
        });

        await newFeedback.save();

        res.status(201).json({ message: 'Feedback submitted successfully', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};

const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find();

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};

module.exports = {
    submitFeedback,
    getAllFeedbacks,
}