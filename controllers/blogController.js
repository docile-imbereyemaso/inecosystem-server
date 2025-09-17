// controllers/blogController.js
const { Blog, Company, BlogComment } = require("../models");

// Create new blog post
exports.createBlog = async (req, res) => {
  try {
    const { companyId, title, content, coverImage, tags, category, status } = req.body;

    const blog = await Blog.create({
      companyId,
      title,
      content,
      coverImage,
      tags,
      category,
      status,
    });

    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating blog", error });
  }
};

// Get all blogs (with optional filters: category, status)
exports.getBlogs = async (req, res) => {
  try {
    const { category, status } = req.query;

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const blogs = await Blog.findAll({
      where,
      include: [{ model: Company, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching blogs", error });
  }
};

// Get single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id, {
      include: [
        { model: Company, attributes: ["id", "name"] },
        { model: BlogComment },
      ],
    });

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // increase views count
    await blog.increment("viewsCount");

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching blog", error });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    await blog.update(req.body);

    res.json({ message: "Blog updated successfully", blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating blog", error });
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    await blog.destroy();

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting blog", error });
  }
};


exports.addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { studentId, comment } = req.body;

    const newComment = await BlogComment.create({
      blogId,
      studentId,
      comment,
    });

    res.status(201).json({ message: "Comment added", newComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding comment", error });
  }
};
