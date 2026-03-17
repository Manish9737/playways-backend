const fs = require("fs");

const deleteLocalFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) console.log("File delete error:", err);
  });
};

module.exports = deleteLocalFile;