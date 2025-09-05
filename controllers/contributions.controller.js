import db from '../models/index.js';
const { Contribution, User } = db;

// CREATE CONTRIBUTION (All user types)
export const createContribution = async (req, res) => {
  try {
    const { 
      title, 
      type, 
      description, 
      content, 
      tags, 
      file_url 
    } = req.body;

    // Validation
    if (!title || !type) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and type are required" 
      });
    }

    const contribution = await Contribution.create({
      title,
      type,
      description: description || null,
      content: content || null,
      tags: tags || [],
      file_url: file_url || null,
      author_id: req.user.user_id,
      status: 'published' // Default to published, can be changed to 'draft'
    });

    // Include author details in response
    const contributionWithAuthor = await Contribution.findByPk(contribution.contribution_id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'user_type']
      }]
    });

    res.status(201).json({ 
      success: true, 
      contribution: contributionWithAuthor,
      message: "Contribution created successfully" 
    });
  } catch (error) {
    console.error("Create contribution error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error creating contribution", 
      error: error.message 
    });
  }
};

// GET ALL CONTRIBUTIONS (All user types)
export const getContributions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      author_id, 
      tags,
      sortBy = 'date_created',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Build where clause for filters
    const whereClause = {};
    
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (author_id) whereClause.author_id = author_id;
    
    if (tags) {
      whereClause.tags = {
        [db.Sequelize.Op.overlap]: Array.isArray(tags) ? tags : [tags]
      };
    }

    // Only show published contributions to non-authors
    if (!author_id || author_id !== req.user.user_id.toString()) {
      whereClause.status = 'published';
    }

    const { count, rows: contributions } = await Contribution.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'user_type']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      contributions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get contributions error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching contributions", 
      error: error.message 
    });
  }
};

// GET CONTRIBUTION BY ID (All user types)
export const getContributionById = async (req, res) => {
  try {
    const { id } = req.params;

    const contribution = await Contribution.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'user_type']
      }]
    });

    if (!contribution) {
      return res.status(404).json({ 
        success: false, 
        message: "Contribution not found" 
      });
    }

    // Only show published contributions to non-authors
    if (contribution.status !== 'published' && contribution.author_id !== req.user.user_id) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. This contribution is not published." 
      });
    }

    // Increment view count for published contributions
    if (contribution.status === 'published') {
      await contribution.increment('views_count');
    }

    res.status(200).json({ 
      success: true, 
      contribution 
    });
  } catch (error) {
    console.error("Get contribution error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching contribution", 
      error: error.message 
    });
  }
};

// GET USER'S CONTRIBUTIONS (Specific user)
export const getUserContributions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status 
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Check if user is viewing their own contributions
    const isOwnContributions = parseInt(userId) === req.user.user_id;

    const whereClause = { author_id: userId };
    
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    
    // Only show published contributions to non-owners
    if (!isOwnContributions) {
      whereClause.status = 'published';
    }

    const { count, rows: contributions } = await Contribution.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'user_type']
      }],
      order: [['date_created', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      contributions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get user contributions error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching user contributions", 
      error: error.message 
    });
  }
};

// UPDATE CONTRIBUTION (Only the author)
export const updateContribution = async (req, res) => {
  try {
    const { id } = req.params;

    const contribution = await Contribution.findOne({
      where: { contribution_id: id, author_id: req.user.user_id }
    });

    if (!contribution) {
      return res.status(404).json({ 
        success: false, 
        message: "Contribution not found or you don't have permission to update it" 
      });
    }

    await contribution.update(req.body);

    const updatedContribution = await Contribution.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'user_type']
      }]
    });

    res.status(200).json({ 
      success: true, 
      contribution: updatedContribution,
      message: "Contribution updated successfully" 
    });
  } catch (error) {
    console.error("Update contribution error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error updating contribution", 
      error: error.message 
    });
  }
};

// DELETE CONTRIBUTION (Only the author)
export const deleteContribution = async (req, res) => {
  try {
    const { id } = req.params;

    const contribution = await Contribution.findOne({
      where: { contribution_id: id, author_id: req.user.user_id }
    });

    if (!contribution) {
      return res.status(404).json({ 
        success: false, 
        message: "Contribution not found or you don't have permission to delete it" 
      });
    }

    await contribution.destroy();

    res.status(200).json({ 
      success: true, 
      message: "Contribution deleted successfully" 
    });
  } catch (error) {
    console.error("Delete contribution error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error deleting contribution", 
      error: error.message 
    });
  }
};

// LIKE CONTRIBUTION (All user types)
export const likeContribution = async (req, res) => {
  try {
    const { id } = req.params;

    const contribution = await Contribution.findByPk(id);

    if (!contribution) {
      return res.status(404).json({ 
        success: false, 
        message: "Contribution not found" 
      });
    }

    // Only allow likes on published contributions
    if (contribution.status !== 'published') {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot like an unpublished contribution" 
      });
    }

    await contribution.increment('likes_count');

    res.status(200).json({ 
      success: true, 
      likes_count: contribution.likes_count + 1,
      message: "Contribution liked successfully" 
    });
  } catch (error) {
    console.error("Like contribution error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error liking contribution", 
      error: error.message 
    });
  }
};

// CHANGE CONTRIBUTION STATUS (Author only)
export const changeContributionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Must be 'draft', 'published', or 'archived'" 
      });
    }

    const contribution = await Contribution.findOne({
      where: { contribution_id: id, author_id: req.user.user_id }
    });

    if (!contribution) {
      return res.status(404).json({ 
        success: false, 
        message: "Contribution not found or you don't have permission to modify it" 
      });
    }

    await contribution.update({ status });

    res.status(200).json({ 
      success: true, 
      message: `Contribution status changed to ${status} successfully` 
    });
  } catch (error) {
    console.error("Change contribution status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error changing contribution status", 
      error: error.message 
    });
  }
};

// GET POPULAR CONTRIBUTIONS (All user types)
export const getPopularContributions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const contributions = await Contribution.findAll({
      where: { status: 'published' },
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'user_type']
      }],
      order: [
        ['likes_count', 'DESC'],
        ['views_count', 'DESC']
      ],
      limit: parseInt(limit)
    });

    res.status(200).json({ 
      success: true, 
      contributions 
    });
  } catch (error) {
    console.error("Get popular contributions error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching popular contributions", 
      error: error.message 
    });
  }
};

// SEARCH CONTRIBUTIONS (All user types)
export const searchContributions = async (req, res) => {
  try {
    const { 
      query, 
      page = 1, 
      limit = 10,
      type,
      tags
    } = req.query;
    
    const offset = (page - 1) * limit;

    const whereClause = { 
      status: 'published' 
    };

    if (query) {
      whereClause[db.Sequelize.Op.or] = [
        { title: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { description: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { content: { [db.Sequelize.Op.iLike]: `%${query}%` } }
      ];
    }

    if (type) whereClause.type = type;
    
    if (tags) {
      whereClause.tags = {
        [db.Sequelize.Op.overlap]: Array.isArray(tags) ? tags : [tags]
      };
    }

    const { count, rows: contributions } = await Contribution.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'user_type']
      }],
      order: [['date_created', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      contributions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Search contributions error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error searching contributions", 
      error: error.message 
    });
  }
};