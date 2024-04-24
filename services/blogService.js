const Blog = require('../model/blogSchema');

class BlogService {
  async getAllBlogs() {
    return await Blog.find();
  }

  async getBlogById(id) {
    return await Blog.findById(id);
  }

  async createBlog(blogData) {
    const blog = new Blog(blogData);
    return await blog.save();
  }

  async updateBlog(id, blogData) {
    return await Blog.findByIdAndUpdate(id, blogData, { new: true });
  }

  async deleteBlog(id) {
    return await Blog.findByIdAndDelete(id);
  }
}

module.exports = new BlogService();
