const cloudinary = require("../config/cloudinary");

const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const parts = imageUrl.split("/");
    const fileName = parts.pop();
    const folderPath = parts.slice(parts.indexOf("upload") + 1).join("/");

    const publicId = `${folderPath}/${fileName.split(".")[0]}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

module.exports = deleteCloudinaryImage;