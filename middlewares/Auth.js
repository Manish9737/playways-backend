const jwt = require("jsonwebtoken");

const verifyToken = (role, cookieName) => (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token missing. Please login.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires ${role} role.`,
      });
    }

    req[role] = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid access token.",
    });
  }
};

const authenticateUser  = verifyToken("user",  "refreshToken");
const authenticateHost  = verifyToken("host",  "hostRefreshToken");
const authenticateAdmin = verifyToken("admin", "adminRefreshToken");

module.exports = { authenticateUser, authenticateHost, authenticateAdmin };