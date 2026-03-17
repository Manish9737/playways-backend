const Activity = require("../../model/activitySchema");
const Blog = require("../../model/blogSchema");
const deleteCloudinaryImage = require("../../utils/deleteCloudinaryImage");
const uploadImage = require("../../utils/uploadImage");

const createBlog = async (req, res) => {
  const { adminId } = req.params;
  try {
    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadImage(req.file, "blogs");
    }

    const { title, content } = req.body;
    const blog = new Blog({ title, content, image: imageUrl });
    const savedBlog = await blog.save();

    const activity = new Activity({
      adminId: adminId,
      activityType: "Blog created",
      actionType: "add",
    });

    await activity.save();

    redis.del(BLOGS_ALL_KEY);

    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const cached = await redis.get(BLOGS_ALL_KEY);

    if (cached) {
      return res.json({
        source: "cache",
        blogs: JSON.parse(cached),
      });
    }

    const blogs = await Blog.find().lean();

    await redis.set(BLOGS_ALL_KEY, JSON.stringify(blogs), { ex: 300 });

    res.json({
      source: "db",
      blogs,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const cached = await redis.get(BLOG_BY_ID_KEY(id));
    if (cached) {
      return res.json({
        source: "cache",
        blog: JSON.parse(cached),
      });
    }

    const blog = await Blog.findById(id).lean();
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    await redis.set(BLOG_BY_ID_KEY(id), JSON.stringify(blog), { ex: 300 });

    res.json({
      source: "db",
      blog,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateBlog = async (req, res) => {
  const { adminId, id } = req.params;
  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", success: false });
    }

    if (req.file) {
      const imageUrl = await uploadImage(req.file, "blogs");
      blog.image = imageUrl;
    }

    const { title, content } = req.body;
    if (title) blog.title = title;
    if (content) blog.content = content;

    await blog.save();

    const activity = new Activity({
      adminId: adminId,
      activityType: "Blog updated",
      actionType: "update",
    });
    await activity.save();

    await redis.del(BLOGS_ALL_KEY);
    await redis.del(BLOG_BY_ID_KEY(id));

    return res.status(200).json({
      message: "Blog updated successfully",
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;
  const { adminId } = req.params;

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found", success: false });
    }

    if (blog.image) {
      await deleteCloudinaryImage(blog.image);
    }

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

    await redis.del(BLOGS_ALL_KEY);
    await redis.del(BLOG_BY_ID_KEY(id));

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
