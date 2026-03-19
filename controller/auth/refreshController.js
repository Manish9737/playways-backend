const jwt = require("jsonwebtoken");
const User = require("../../model/userSchema");
const Host = require("../../model/hostSchema");
const Admin = require("../../model/adminSchema");
const generateAccessToken = require("../../utils/generateAccessToken");
const generateRefreshToken = require("../../utils/generateRefreshToken");

const createRefreshHandler = (Model, cookieName, role) => async (req, res) => {
  const token = req.cookies[cookieName];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing. Please login again.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const entity = await Model.findById(decoded.id).select("+refreshToken");

    if (!entity || entity.refreshToken !== token) {
      res.clearCookie(cookieName);
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token. Please login again.",
      });
    }

    const payload = { id: entity._id, role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    entity.refreshToken = newRefreshToken;
    await entity.save();

    res.cookie(cookieName, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.clearCookie(cookieName);
    return res.status(401).json({
      success: false,
      message: "Refresh token expired or invalid. Please login again.",
    });
  }
};

const createLogoutHandler = (Model, cookieName) => async (req, res) => {
  const token = req.cookies[cookieName];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await Model.findByIdAndUpdate(decoded.id, { refreshToken: null });
    } catch {}
  }

  res.clearCookie(cookieName);
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully." });
};

const refreshUserToken = createRefreshHandler(User, "refreshToken", "user");
const refreshHostToken = createRefreshHandler(Host, "hostRefreshToken", "host");
const refreshAdminToken = createRefreshHandler(
  Admin,
  "adminRefreshToken",
  "admin",
);

const logoutUser = createLogoutHandler(User, "refreshToken");
const logoutHost = createLogoutHandler(Host, "hostRefreshToken");
const logoutAdmin = createLogoutHandler(Admin, "adminRefreshToken");

module.exports = {
  refreshUserToken,
  refreshHostToken,
  refreshAdminToken,
  logoutUser,
  logoutHost,
  logoutAdmin,
};
