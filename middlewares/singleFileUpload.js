const multer = require("multer");
const path = require("path");

const storage = (folderName) => multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `public/${folderName}`);
  },
  filename: function (req, file, cb){
    cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a unique name
  },
});

const upload = (folderName) => multer({ storage: storage(folderName) });

module.exports = upload;
