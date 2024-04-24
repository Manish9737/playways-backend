const Admin = require("../model/adminSchema");

const checkSuperUser = async (req, res, next) => {
  const { adminId } = req.params;

  try {
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found", success: false });
    }

    if (!admin.isSuperUser) {
      return res.status(401).json({ error: "Unauthorized", success: false });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};

module.exports = { checkSuperUser };
