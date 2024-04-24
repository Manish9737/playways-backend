var express = require("express");
var router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../../controller/blog/blogsContoller");
const upload = require("../../middlewares/singleFileUpload");

router.post("/add", upload("images").single("image"), createBlog);
router.get("/get", getAllBlogs);
router.get("/get/:id", getBlogById);
router.put("/:id/update", upload("images").single("image"), updateBlog);
router.delete("/:id/delete", deleteBlog);

module.exports = router;
