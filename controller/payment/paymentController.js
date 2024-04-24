const razorpay = require("razorpay");
const Payment = require("../../model/paymentSchema");
const User = require("../../model/userSchema");

const razorpayInstance = new razorpay({
  key_id: process.env.RAZOR_PAY_KEY,
  key_secret: process.env.RAZOR_PAY_SECRET,
});

const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount,
      currency: "INR",
    };

    razorpayInstance.orders.create(options, (err, order) => {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        res.status(500).json({ message: "Failed to create Razorpay order" });
      } else {
        res.json({ orderId: order.id });
      }
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

const paymentVerification = async (req, res, next) => {
  try {
    const {
      userId,
      gsId,
      currency,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    const payment = new Payment({
      userId,
      gsId,
      currency,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      status: "success",
    });

    await payment.save();

    res.json({ message: "Payment details saved successfully", success: true, payment });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

const allPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllPaymentsByGsId = async (req, res) => {
  try {
    const { gsId } = req.params;

    const payments = await Payment.find({ gsId: gsId }).populate("userId");

    if (payments.length > 0) {
      res.json(payments);
    } else {
      res
        .status(404)
        .json({ message: "No payments found for the provided GS ID" });
    }
  } catch (error) {
    console.error("Error retrieving payments by GS ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createRazorpayOrder,
  paymentVerification,
  allPayments,
};
