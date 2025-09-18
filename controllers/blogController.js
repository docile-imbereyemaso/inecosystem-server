const { Blog, User, BlogComment } = require("../models");

// Create new blog post
export const createBlog = async (req, res) => {
  try {
    const { userId, title, content, coverImage, tags, category, status } = req.body;

    const blog = await Blog.create({
      userId,
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
export const getBlogs = async (req, res) => {
  try {
    const { category, status } = req.query;

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const blogs = await Blog.findAll({
      where,
      include: [{ model: User, attributes: ["user_id", "first_name", "last_name"], as: "author" }],
      order: [["createdAt", "DESC"]],
    });

    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching blogs", error });
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["user_id", "first_name", "last_name"], as: "author" },
        { model: BlogComment, include: [{ model: User, attributes: ["user_id", "first_name", "last_name"], as: "student" }] },
      ],
    });

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Increase views count
    await blog.increment("viewsCount");

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching blog", error });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
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
export const deleteBlog = async (req, res) => {
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

// Add comment to blog
export const addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { userId, comment } = req.body;

    const newComment = await BlogComment.create({
      blogId,
      userId,
      comment,
    });

    res.status(201).json({ message: "Comment added", newComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding comment", error });
  }
};
