const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = (folderName) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = `public/${folderName}`;

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },

    filename: function (req, file, cb) {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueName + path.extname(file.originalname));
    },
  });

const upload = (folderName) =>
  multer({
    storage: storage(folderName),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowed = /jpg|jpeg|png|webp|pdf|mp4|mov|avi|mkv|xls|xlsx|csv/;

      const ext = allowed.test(
        path.extname(file.originalname).toLowerCase()
      );

      if (ext) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only images, videos, PDFs, and Excel files are allowed"
          )
        );
      }
    }
  });

module.exports = upload;
