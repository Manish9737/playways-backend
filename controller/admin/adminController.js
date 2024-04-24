const Admin = require("../../model/adminSchema");
const Activity = require("../../model/activitySchema");
const User = require("../../model/userSchema");
const Game = require("../../model/gameSchema");
const Qoute = require("../../model/quoteSchema");
const Host = require("../../model/hostSchema");
const GameStation = require("../../model/gsSchema");
const sendEmail = require("../../Email/email");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const registerAdmin = async (req, res) => {
  const { userName, email, password, isSuperUser } = req.body;

  try {
    let existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const newAdmin = new Admin({
      userName,
      email,
      password,
      isSuperUser,
    });

    await newAdmin.save();

    res
      .status(201)
      .json({ message: "Admin registered successfully", admin: newAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({
      error: "Please provide email/phone and password.",
      success: false,
    });
  }

  try {
    let admin;

    const isEmail = /\S+@\S+\.\S+/.test(email);
    if (isEmail) {
      admin = await Admin.findOne({ email }).select("+password");
    } else {
      return res.status(422).json({
        error: "Please provide a valid email.",
        success: false,
      });
    }

    if (!admin) {
      return res
        .status(404)
        .json({ error: "Admin not found.", success: false });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Invalid credentials.", success: false });
    }

    return res.status(200).json({
      message: "Login successful",
      success: true,
      admin: admin.toObject(),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const adminDetails = async (req, res, next) => {
  const { adminId } = req.params;

  try {
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json({ admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const allAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users", success: false });
  }
};

const sendEmailbyAdmin = async (req, res, next) => {
  const { adminId } = req.params;
  try {
    const { to, subject, content } = req.body;

    if (!to || !subject || !content) {
      return res
        .status(422)
        .json({ error: "Please fill the fields properly.", success: false });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email,
        pass: process.env.PasswordEmail,
      },
    });

    const mailOptions = {
      from: process.env.Email,
      to,
      subject,
      html: content,
    };

    await transporter.sendMail(mailOptions);

    const activity = new Activity({
      adminId: adminId,
      activityType: "Email sent",
      actionType: "other",
    });

    await activity.save();

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { newPassword } = req.body;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found." });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addAdmin = async (req, res, next) => {
  const { adminId } = req.params;
  const { userName, email, password, isSuperUser } = req.body;

  try {
    const superUser = await Admin.findById(adminId);

    if (!superUser || !superUser.isSuperUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const newAdmin = new Admin({
      userName,
      email,
      password,
      isSuperUser,
    });

    await newAdmin.save();

    const activity = new Activity({
      adminId: adminId,
      activityType: "Admin added",
      actionType: "delete",
    });

    await activity.save();

    res
      .status(201)
      .json({ message: "Admin added successfully", admin: newAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteAdmin = async (req, res, next) => {
  const { adminId } = req.params;
  const { id } = req.params;

  try {
    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });
    }

    const activity = new Activity({
      adminId: adminId,
      activityType: "Admin deleted",
      actionType: "delete",
    });

    await activity.save();

    return res
      .status(200)
      .json({ message: "Admin deleted successfully", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const getRecentActivities = async (req, res, next) => {
  const { adminId } = req.params;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const recentActivities = await Activity.find({ adminId: adminId })
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({ activities: recentActivities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// users
const allUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users", success: false });
  }
};

const AddUser = async (req, res, next) => {
  const { adminId } = req.params;
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

      const activity = new Activity({
        adminId: adminId,
        activityType: "User Added",
        actionType: "add",
      });

      await activity.save();

      const subject = "Welcome to PlayWays Family.";
      const content = `
        <h2>Dear ${userName},</h2>
        <p>Thank you for registering with us!</p>
        <p>Your account has been successfully created.</p>
        <p>Best regards,</p>
        <p>PlayWays Team</p>
        <hr>
        <p>For Support, <a href="http://localhost:3000/contactUs">Click here</a></p>
      `;

      await sendEmail(email, subject, content);

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

const updateUser = async (req, res) => {
  const { adminId } = req.params;
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    user.userName = req.body.userName || user.userName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    if (req.file) {
      const imgFileName = req.file.filename;
      const imgPath = `/images/${imgFileName}`;
      user.ProfileImg = imgPath;
    }

    const updatedUser = await user.save();

    const activity = new Activity({
      adminId: adminId,
      activityType: "User Updated",
      actionType: "update",
    });

    await activity.save();

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
  const { adminId } = req.params;
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const activity = new Activity({
      adminId: adminId,
      activityType: "User deleted",
      actionType: "delete",
    });

    await activity.save();

    return res
      .status(200)
      .json({ message: "User deleted Successfully", success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// Quotes
const allQuotes = async (req, res, next) => {
  try {
    const quotes = await Qoute.find();

    res.status(200).json({ quotes });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const addQuote = async (req, res, next) => {
  const { adminId } = req.params;
  const { name, quote } = req.body;

  if (!name || !quote) {
    return res.status(422).json({ error: "Please fill the fields properly." });
  }

  try {
    const quoteExist = await Qoute.findOne({ quote: quote });

    if (quoteExist) {
      return res.status(422).json({ error: "Quote already Exist." });
    } else {
      const quotes = new Qoute({ name, quote });

      await quotes.save();

      const activity = new Activity({
        adminId: adminId,
        activityType: "Quote Added",
        actionType: "add",
      });

      await activity.save();

      return res
        .status(200)
        .json({ message: "Quote is saved successfully.", success: true });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const updateQuote = async (req, res, next) => {
  const { adminId } = req.params;
  const { id } = req.params;
  const { name, quote } = req.body;

  try {
    const updatedQuote = await Qoute.findByIdAndUpdate(
      id,
      { name, quote },
      { new: true }
    );

    if (!updatedQuote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const activity = new Activity({
      adminId: adminId,
      activityType: "Quote updated",
      actionType: "update",
    });

    await activity.save();

    return res
      .status(200)
      .json({ message: "Quote updated successfully", quote: updatedQuote });
  } catch (error) {
    console.error("Error updating quote:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteQuote = async (req, res, next) => {
  const { adminId } = req.params;
  const { id } = req.params;

  try {
    const deletedQuote = await Qoute.findByIdAndDelete(id);

    if (!deletedQuote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const activity = new Activity({
      adminId: adminId,
      activityType: "Quote deleted",
      actionType: "delete",
    });

    await activity.save();

    return res
      .status(200)
      .json({ message: "Quote deleted successfully", quote: deletedQuote });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Games
const allGames = async (req, res, next) => {
  try {
    const games = await Game.find();
    res.status(200).json({ games });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addGame = async (req, res, next) => {
  const { adminId } = req.params;

  try {
    const { name } = req.body;
    const image = req.file ? req.file.filename : "";
    const imgPath = `/images/${image}`;

    const newGame = new Game({
      image: imgPath,
      name,
    });

    await newGame.save();

    const activity = new Activity({
      adminId: adminId,
      activityType: "Game Added",
      actionType: "add",
    });

    await activity.save();

    res.status(201).json({
      message: "Game added successfully",
      game: newGame,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const updateGame = async (req, res, next) => {
  const { adminId } = req.params;
  const { id } = req.params;
  const updateData = req.body;
  try {
    const game = await Game.findById(id);

    if (!game) {
      return res
        .status(404)
        .json({ message: "Game not found", success: false });
    }

    if (req.file) {
      const filePath = req.file.filename;
      console.log(filePath);
      const path = `/images/${filePath}`;
      updateData.image = path;
    }

    Object.assign(game, updateData);

    await game.save();

    const activity = new Activity({
      adminId: adminId,
      activityType: "Game updated",
      actionType: "update",
    });

    await activity.save();

    res
      .status(200)
      .json({ message: "Game updated successfully", success: true, game });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};

const deleteGame = async (req, res, next) => {
  const { adminId } = req.params;
  const { id } = req.params;
  try {
    await Game.findByIdAndDelete(id);

    const activity = new Activity({
      adminId: adminId,
      activityType: "Game deleted",
      actionType: "delete",
    });

    await activity.save();

    res.status(200).json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// hosts
const allHosts = async (req, res, next) => {
  try {
    const hosts = await Host.find();
    res.status(200).json({ hosts });
  } catch (error) {
    console.log({ message: "Internal server error", success: false });
  }
};

const addHost = async (req, res, next) => {
  const { adminId } = req.params;
  const { email, password, phone } = req.body;

  if (!email || !phone || !password) {
    return res.status(422).json({ error: "Please fill the fields properly." });
  }

  try {
    const hostExist = await Host.findOne({ email: email });

    if (hostExist) {
      return res
        .status(422)
        .json({ error: "Email already Exist.", success: false });
    } else {
      const Hosts = new Host({
        email,
        phone,
        password,
      });

      const savedHost = await Hosts.save();

      const activity = new Activity({
        adminId: adminId,
        activityType: "Host Added",
        actionType: "add",
      });

      await activity.save();

      const subject = "Welcome to PlayWays Family.";
      const content = `
        <h2>Dear ${email},</h2>
        <p>Thank you for registering with us!</p>
        <p>Your account has been successfully created.</p>
        <p>Best regards,</p>
        <p>PlayWays Team</p>
        <hr>
        <p>For Support, <a href="http://localhost:3000/contact">Click here</a></p>
      `;

      await sendEmail(email, subject, content);

      console.log("Host is Registered");
      return res.status(200).json({
        message: "Host is Registered",
        success: true,
        host_id: savedHost._id,
        email: savedHost.email,
        phone: savedHost.phone,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const updateHost = async (req, res, next) => {
  const { adminId } = req.params;
  const { hostId } = req.params;
  const updateData = req.body;

  try {
    const host = await Host.findById(hostId);

    if (!host) {
      return res
        .status(404)
        .json({ message: "Host not found", success: false });
    }

    Object.assign(host, updateData);

    await host.save();

    const activity = new Activity({
      adminId: adminId,
      activityType: "Host updated",
      actionType: "update",
    });

    await activity.save();

    return res
      .status(200)
      .json({ message: "Host data updated successfully", success: true, host });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const deleteHost = async (req, res, next) => {
  const { adminId } = req.params;
  const { hostId } = req.params;

  try {
    const host = await Host.findByIdAndDelete(hostId);

    if (!host) {
      return res
        .status(404)
        .json({ message: "Host not found", success: false });
    }

    const activity = new Activity({
      adminId: adminId,
      activityType: "Host deleted",
      actionType: "delete",
    });

    await activity.save();

    return res
      .status(200)
      .json({ message: "Host deleted successfully", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// GameStation
const allGameStations = async (req, res, next) => {
  try {
    const gameStations = await GameStation.find({});

    res.status(200).json({ gameStations });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const addGameStation = async (req, res, next) => {
  const { adminId } = req.params;

  try {
    const gsLogoFilename = req.file ? req.file.filename : "";
    console.log(gsLogoFilename);
    imgPath = `/images/${gsLogoFilename}`;

    const {
      host,
      name,
      email,
      phone,
      city,
      state,
      country,
      latitude,
      longitude,
      address,
    } = req.body;

    if (
      !host ||
      !name ||
      !email ||
      !phone ||
      !city ||
      !state ||
      !country ||
      !latitude ||
      !longitude ||
      !address
    ) {
      return res
        .status(422)
        .json({ error: "Please fill the fields properly.", success: false });
    }

    const GameStations = new GameStation({
      host,
      name,
      email,
      phone,
      gsLogo: imgPath,
      city,
      state,
      country,
      latitude,
      longitude,
      address,
    });

    await GameStations.save();

    const activity = new Activity({
      adminId: adminId,
      activityType: "GameStation Added",
      actionType: "add",
    });

    await activity.save();

    return res.status(200).json({
      message: "Game Station added successfully.",
      success: true,
      GameStations,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

const updateGameStation = async (req, res, next) => {
  const { adminId } = req.params;
  const { id } = req.params;
  const updateData = req.body;

  try {
    const gameStation = await GameStation.findById(id).catch((error) => {
      console.error("Error in findById:", error);
      throw error;
    });

    if (!gameStation) {
      return res
        .status(404)
        .json({ message: "GameStation not found", success: false });
    }

    if (req.file) {
      const imgFileName = req.file.filename;
      const imgPath = `/images/${imgFileName}`;
      gameStation.gsLogo = imgPath;
    }

    Object.assign(gameStation, updateData);

    await gameStation.save().catch((error) => {
      console.error("Error in saving game station:", error);
      throw error;
    });

    const activity = new Activity({
      adminId: adminId,
      activityType: "GameStation updated",
      actionType: "update",
    });

    await activity.save();

    return res.status(200).json({
      message: "GameStation data updated successfully",
      success: true,
      gameStation,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const deleteGameStation = async (req, res, next) => {
  const { adminId } = req.params;
  const { id } = req.params;

  try {
    const admin = await Admin.findById(adminId);

    if (!admin || !admin.isSuperUser) {
      return res.status(401).json({ error: "Unauthorized", success: false });
    }

    const deletedGameStation = await GameStation.findByIdAndDelete(id);

    if (!deletedGameStation) {
      return res
        .status(404)
        .json({ message: "GameStation not found", success: false });
    }

    const activity = new Activity({
      adminId: adminId,
      activityType: "GameStation deleted",
      actionType: "delete",
    });

    await activity.save();

    return res
      .status(200)
      .json({ message: "GameStation deleted successfully", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const getCountOfStationsById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const stations = await GameStation.find({ host: id });

    let allowedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    stations.forEach((station) => {
      if (station.status === "Allowed") {
        allowedCount++;
      } else if (station.status === "Pending") {
        pendingCount++;
      } else if (station.status === "Rejected") {
        rejectedCount++;
      }
    });

    const totalCount = stations.length;

    res.json({
      allowed: allowedCount,
      pending: pendingCount,
      rejected: rejectedCount,
      total: totalCount,
      stations,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const getAllGsByHostId = async (req, res, next) => {
  const { id } = req.params;
  try {
    const host = await Host.findById(id);

    if (!host) {
      return res.status(404).json({ error: "Host not found.", success: false });
    }

    const gameStations = await GameStation.find({ host: id }).select("-host");

    const gameStationsWithImages = gameStations.map((station) => {
      return {
        _id: station._id,
        name: station.name,
        email: station.email,
        phone: station.phone,
        gsLogo: station.gsLogo,
        city: station.city,
        state: station.state,
        country: station.country,
        latitude: station.latitude,
        longitude: station.longitude,
        address: station.address,
        status: station.status,
      };
    });

    return res
      .status(200)
      .json({ gameStations: gameStationsWithImages, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

const getGsById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const gameStation = await GameStation.findById(id);

    if (!gameStation) {
      return res.status(404).json({ message: "GameStation not found" });
    }

    res.status(200).json({ gameStation });
  } catch (error) {
    // Handle errors
    console.error("Error fetching GameStation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  allAdmins,
  deleteAdmin,
  adminDetails,
  sendEmailbyAdmin,
  changePassword,
  addAdmin,
  getRecentActivities,

  allUsers,
  AddUser,
  updateUser,
  deleteUser,

  allQuotes,
  addQuote,
  updateQuote,
  deleteQuote,

  allGames,
  addGame,
  updateGame,
  deleteGame,

  allHosts,
  addHost,
  updateHost,
  deleteHost,

  allGameStations,
  addGameStation,
  updateGameStation,
  deleteGameStation,
  getCountOfStationsById,
  getAllGsByHostId,
  getGsById,
};
