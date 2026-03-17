const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `playways/${folder}`,
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    throw new Error("Cloudinary Upload Failed");
  }
};

module.exports = uploadToCloudinary;