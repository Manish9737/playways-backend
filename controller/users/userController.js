const mongoose = require("mongoose");
const User = require("../../model/userSchema");
const GameStation = require("../../model/gsSchema");
const Booking = require("../../model/bookingSchema");
const Game = require("../../model/gameSchema");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
// const sendEmail = require("../../Email/email");
const ViewedGameStation = require("../../model/viewedGameStation");
const uploadImage = require("../../utils/uploadImage");
const deleteCloudinaryImage = require("../../utils/deleteCloudinaryImage");
const generateAccessToken = require("../../utils/generateAccessToken");
const generateRefreshToken = require("../../utils/generateRefreshToken");
const {
  welcomeTemplate,
  otpTemplate,
  passwordResetSuccessTemplate,
} = require("../../Email/templates/templates");
const sendEmail = require("../../services/sendEmail");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const sendOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email,
        pass: process.env.PassWordEmail,
      },
    });

    const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <!-- Bootstrap CSS -->
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
        <style>
            /* Custom CSS */
            body {
                font-family: Arial, sans-serif;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 10px;
                background-color: #f8f9fa;
            }
            .text-center {
                text-align: center;
            }
            .text-dark {
              color: black;
            }
            .otp {
              color: blue;
              font-size: 35px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="text-center">
                <h1 class="display-3 text-dark text-center">Play Ways</h1>
            </div>
            <h2 class="text-center text-dark">Password Reset OTP</h2>
            <p>Hello,</p>
            <p>Your OTP for password reset is: <strong class="otp">${otp}</strong></p>
            <p>Please use this OTP to reset your password. It will expire after a short period of time.</p>
            <p>If you did not request a password reset, please ignore this email.</p><br/>
            <div>
                <p>Regards,</p>
                <p>Play Ways Team</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: "PlayWays <" + process.env.Email + ">",
      to: email,
      subject: "Password Reset OTP",
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const registerUser = async (req, res, next) => {
  const { userName, email, phone, password } = req.body;

  if (!userName || !email || !phone || !password) {
    return res
      .status(422)
      .json({ error: "Please fill the fields properly.", success: false });
  }

  try {
    const UserExist = await User.findOne({ email: email });

    if (UserExist) {
      return res
        .status(422)
        .json({ error: "Email already Exist.", success: false });
    } else {
      const users = new User({ userName, email, phone, password });

      const savedUser = await users.save();

      await sendEmail(
        email,
        "Welcome to PlayWays Family",
        welcomeTemplate({ name: userName, role: "user" }),
      );

      return res.status(200).json({
        message: "User is Registered",
        success: true,
        User_id: savedUser._id,
        email: savedUser.email,
        phone: savedUser.phone,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const loginUser = async (req, res, next) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(422).json({
      error: "Please provide email/phone and password.",
      success: false,
    });
  }

  try {
    let user;

    const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
    if (isEmail) {
      user = await User.findOne({ email: emailOrPhone }).select("+password");
    } else {
      user = await User.findOne({ phone: emailOrPhone }).select("+password");
    }

    if (!user) {
      return res.status(404).json({ error: "User not found.", success: false });
    }
    const { password: hashedPassword, ...userWithoutPassword } =
      user.toObject();

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Invalid credentials.", success: false });
    }

    const payload = { id: user._id, role: "user" };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      success: true,
      accessToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const userDetails = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId, "-password");

    if (!user) {
      return res.status(404).json({ error: "User not found", success: false });
    }

    res.status(200).json({
      user,
      message: "User details retrieved successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error in userDetails:", error);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const updatedFields = {};

    if (req.body.userName) updatedFields.userName = req.body.userName;
    if (req.body.email) updatedFields.email = req.body.email;
    if (req.body.phone) updatedFields.phone = req.body.phone;

    if (req.file) {
      const imageUrl = await uploadImage(req.file, "users");
      updatedFields.ProfileImg = imageUrl;
    }

    Object.assign(user, updatedFields);

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
      success: true,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const userToDelete = await User.findById(userId);

    if (!userToDelete) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    await deleteCloudinaryImage(userToDelete.ProfileImg);

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    return res
      .status(200)
      .json({ message: "User deleted Successfully", success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const allUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users", success: false });
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({
      error: "Please provide the email address.",
      success: false,
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found.", success: false });
    }

    const otp = generateOTP();
    const sent = await sendEmail(
      email,
      "Your OTP for Password Reset",
      otpTemplate({ otp, purpose: "Password Reset" }),
    );

    if (sent) {
      user.resetPasswordOTP = otp;
      await user.save();

      return res
        .status(200)
        .json({ message: "OTP sent successfully", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "Failed to send OTP", success: false });
    }
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found.", success: false });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP", success: false });
    }

    user.password = newPassword;
    user.resetPasswordOTP = null;
    await user.save();

    await sendEmail(
      email,
      "Password Reset Successful",
      passwordResetSuccessTemplate({
        name: user.userName,
        redirectUrl: `${process.env.CLIENT_URL}`,
      }),
    );

    res
      .status(200)
      .json({ message: "Password reset successful.", success: true });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const fetchOTP = async (req, res) => {
  try {
    const { email, OTP } = req.body;
    console.log(`email: ${email}`, `otp: ${OTP}`)

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.resetPasswordOTP !== OTP) {
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error fetching OTP:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

const uploadImg = async (req, res, next) => {
  const userId = req.params.id;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadImage(req.file, "users");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ProfileImg: imageUrl },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ imageUrl: imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Error uploading image" });
  }
};

const contactUs = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res
        .status(422)
        .json({ error: "Please fill the fields properly.", success: false });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email,
        pass: process.env.PassWordEmail,
      },
    });

    const mailOptions = {
      from: "PlayWays <" + process.env.Email + ">",
      to: "kumavatmanish5@gmail.com",
      subject: subject,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send message" });
      } else {
        console.log("Email sent:", info.response);
        res.status(200).json({ message: "Message sent successfully" });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findGameStationById = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const gameStation = await GameStation.findById(id);

    if (!gameStation) {
      return res.status(404).json({ message: "Game station not found" });
    }

    const viewedRecord = await ViewedGameStation.findOne({
      userId,
      gameStationId: id,
    });

    if (!viewedRecord) {
      await GameStation.findByIdAndUpdate(id, { $inc: { viewers: 1 } });
      await ViewedGameStation.create({ userId, gameStationId: id });
    }

    res.status(200).json({ message: "Game station found", gameStation });
  } catch (error) {
    console.error("Error finding game station by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllBookingsByUserId = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const bookings = await Booking.find({ userId })
      .populate("game")
      .populate("gameStationId");

    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this user", success: false });
    }

    return res.status(200).json({ bookings, success: true });
  } catch (error) {
    console.error("Error fetching bookings by userId:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const getGamesOfGs = async (req, res, next) => {
  const { stationId } = req.params;

  try {
    const gameStation =
      await GameStation.findById(stationId).populate("games.game");

    if (!gameStation) {
      return res.status(404).json({ message: "GameStation not found" });
    }

    const games = gameStation.games.map((game) => ({
      id: game.game.id,
      image: game.game.image,
      name: game.game.name,
      timing: game.time,
      description: game.description,
      slotPrice: game.slotPrice,
    }));

    res.status(200).json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  userDetails,
  updateProfile,
  forgotPassword,
  resetPassword,
  deleteUser,
  allUsers,
  uploadImg,
  fetchOTP,
  generateOTP,
  sendOTP,
  contactUs,
  findGameStationById,
  getAllBookingsByUserId,
  getGamesOfGs,
};
