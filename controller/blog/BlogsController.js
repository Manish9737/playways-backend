const Activity = require("../../model/activitySchema");
const Blog = require("../../model/blogSchema");

const createBlog = async (req, res) => {
  const { adminId } = req.params;
  try {
    let imgPath = null;

    if (req.file) {
      const { filename } = req.file;
      imgPath = `/images/${filename}`;
    }

    const { title, content } = req.body;
    const blog = new Blog({ title, content, image: imgPath });
    const savedBlog = await blog.save();

    const activity = new Activity({
      adminId: adminId,
      activityType: "Blog created",
      actionType: "add",
    });

    await activity.save();

    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateBlog = async (req, res, next) => {
  const { adminId } = req.params;
  const { id } = req.params;
  const updateData = req.body;

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", success: false });
    }

    Object.assign(blog, updateData);

    await blog.save();

    const activity = new Activity({
      adminId: adminId,
      activityType: "Blog updated",
      actionType: "update",
    });

    await activity.save();

    return res
      .status(200)
      .json({ message: "Blog data updated successfully", success: true, blog });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;
  const { adminId } = req.params;

  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const activity = new Activity({
      adminId: adminId,
      activityType: "Blog deleted",
      actionType: "delete",
    });

    await activity.save();
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
