const uploadToCloudinary = require("../services/cloudinary.service");
const deleteLocalFile = require("./deleteLocalFile");

const uploadVideo = async (file, folder) => {
  if (!file) return null;

  try {
    const filePath = file.path;

    const result = await uploadToCloudinary(filePath, folder, "video");

    deleteLocalFile(filePath);

    return result.secure_url;
  } catch (error) {
    throw new Error("Video upload failed");
  }
};

module.exports = uploadVideo;
