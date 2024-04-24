var express = require("express");
const {
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../../controller/blog/BlogsController");
var router = express.Router();

router.post("/add", upload("images").single("image"), createBlog);
router.get("/get", getAllBlogs);
router.get("/get/:id", getBlogById);
router.put("/:id/update", upload("images").single("image"), updateBlog);
router.delete("/:id/delete", deleteBlog);

module.exports = router;
