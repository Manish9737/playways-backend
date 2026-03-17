const uploadToCloudinary = require("../services/cloudinary.service");
const deleteLocalFile = require("./deleteLocalFile");

const uploadImage = async (file, folder) => {
  if (!file) return null;

  try {
    const filePath = file.path;

    const result = await uploadToCloudinary(filePath, folder, "image");

    deleteLocalFile(filePath);

    return result.secure_url;

  } catch (error) {
    throw new Error("Image upload failed");
  }
};

module.exports = uploadImage;