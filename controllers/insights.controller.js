import db from '../models/index.js';
// const { Op } = require('sequelize');
import { Op } from 'sequelize';
const { Insight, User } = db;

// CREATE INSIGHT (Private sector only - approved)
export const createInsight = async (req, res) => {
  try {
    // Check if user is approved private sector
    if (req.user.user_type !== 'private_sector' || !req.user.is_approved) {
      return res.status(403).json({ 
        success: false, 
        message: "Only approved private sector users can create insights" 
      });
    }

    const { 
      title, 
      sector, 
      skills_gap_suggestion, 
      priority, 
      tags 
    } = req.body;

    // Validation
    if (!title || !sector || !skills_gap_suggestion) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, sector, and skills gap suggestion are required" 
      });
    }

    const insight = await Insight.create({
      title,
      sector,
      skills_gap_suggestion,
      priority: priority || 'medium',
      tags: tags || [],
      created_by: req.user.user_id,
      status: 'pending'
    });

    // Include author details in response
    const insightWithAuthor = await Insight.findByPk(insight.insight_id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email']
      }]
    });

    res.status(201).json({ 
      success: true, 
      insight: insightWithAuthor,
      message: "Insight created successfully and submitted for review" 
    });
  } catch (error) {
    console.error("Create insight error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error creating insight", 
      error: error.message 
    });
  }
};


// GET ALL INSIGHTS
export const getInsights = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sector, 
      priority, 
      status,
      created_by,
      sortBy = 'date_created',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Build where clause for filters
    const whereClause = {};
    
    if (sector) whereClause.sector = sector;
    if (priority) whereClause.priority = priority;
    if (status) whereClause.status = status;
    if (created_by) whereClause.created_by = created_by;
    
    // return res.json({whereClause})
    // Private sector users can only see their own insights if not published
    // if (req.user.user_type === 'private_sector') {
    //   if (!created_by || created_by !== req.user.user_id.toString()) {
    //     // whereClause.status = { [Op.ne]: 'pending' };
    //     whereClause.status = { [Op.ne]: 'pending' };
    //   }
    // } else {
    //   // Other users can't see pending insights
    //   whereClause.status = { [Op.ne]: 'pending' };
    // }

    const { count, rows: insights } = await Insight.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 
    'email', 'user_type']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: offset
    });

    // const insights = await Insight.findAll({
    //   include:[
    //     {
    //       model:User,
    //       as:"author"
    //     }
    //   ]
    // })

    res.status(200).json({ 
      success: true, 
      insights,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get insights error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching insights", 
      error: error.message 
    });
  }
};

// GET INSIGHT BY ID
export const getInsightById = async (req, res) => {
  try {
    const { id } = req.params;

    const insight = await Insight.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email', 'user_type']
      }]
    });

    if (!insight) {
      return res.status(404).json({ 
        success: false, 
        message: "Insight not found" 
      });
    }

    // Private sector users can only see their own pending insights
    if (insight.status === 'pending' && insight.created_by !== req.user.user_id) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. This insight is not published." 
      });
    }

    res.status(200).json({ 
      success: true, 
      insight 
    });
  } catch (error) {
    console.error("Get insight error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching insight", 
      error: error.message 
    });
  }
};

// GET USER'S INSIGHTS (Private sector users)
export const getUserInsights = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      status 
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Check if user is viewing their own insights
    const isOwnInsights = parseInt(userId) === req.user.user_id;

    const whereClause = { created_by: userId };
    
    if (status) whereClause.status = status;
    
    // Only show non-pending insights to non-owners
    if (!isOwnInsights) {
      whereClause.status = { $ne: 'pending' };
    }

    const { count, rows: insights } = await Insight.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email', 'user_type']
      }],
      order: [['date_created', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      insights,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get user insights error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching user insights", 
      error: error.message 
    });
  }
};

// UPDATE INSIGHT (Only the creator)
export const updateInsight = async (req, res) => {
  try {
    const { id } = req.params;

    const insight = await Insight.findOne({
      where: { insight_id: id, created_by: req.user.user_id }
    });

    if (!insight) {
      return res.status(404).json({ 
        success: false, 
        message: "Insight not found or you don't have permission to update it" 
      });
    }

    await insight.update(req.body);

    const updatedInsight = await Insight.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email', 'user_type']
      }]
    });

    res.status(200).json({ 
      success: true, 
      insight: updatedInsight,
      message: "Insight updated successfully" 
    });
  } catch (error) {
    console.error("Update insight error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error updating insight", 
      error: error.message 
    });
  }
};

// DELETE INSIGHT (Only the creator)
export const deleteInsight = async (req, res) => {
  try {
    const { id } = req.params;

    const insight = await Insight.findOne({
      where: { insight_id: id, created_by: req.user.user_id }
    });

    if (!insight) {
      return res.status(404).json({ 
        success: false, 
        message: "Insight not found or you don't have permission to delete it" 
      });
    }

    await insight.destroy();

    res.status(200).json({ 
      success: true, 
      message: "Insight deleted successfully" 
    });
  } catch (error) {
    console.error("Delete insight error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error deleting insight", 
      error: error.message 
    });
  }
};

// CHANGE INSIGHT STATUS (Author only)
export const changeInsightStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (![ 'pending', 'reviewed', 'implemented', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }

    const insight = await Insight.findOne({
      where: { insight_id: id, created_by: req.user.user_id }
    });

    if (!insight) {
      return res.status(404).json({ 
        success: false, 
        message: "Insight not found or you don't have permission to modify it" 
      });
    }

    await insight.update({ status });

    res.status(200).json({ 
      success: true, 
      message: `Insight status changed to ${status} successfully` 
    });
  } catch (error) {
    console.error("Change insight status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error changing insight status", 
      error: error.message 
    });
  }
};

// GET INSIGHTS BY SECTOR
export const getInsightsBySector = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const offset = (page - 1) * limit;

    // For individual users, filter by their sectors
    let whereClause = { status: { [Op.ne]: 'pending' } };
    
    if (req.user.user_type === 'individual' && req.user.sectors && req.user.sectors.length > 0) {
      whereClause.sector = req.user.sectors;
    }

    const { count, rows: insights } = await Insight.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email', 'user_type']
      }],
      order: [['date_created', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      insights,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get insights by sector error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching insights by sector", 
      error: error.message 
    });
  }
};

// SEARCH INSIGHTS
export const searchInsights = async (req, res) => {
  try {
    const { 
      query, 
      page = 1, 
      limit = 10,
      sector,
      priority
    } = req.query;
    
    const offset = (page - 1) * limit;

    const whereClause = { 
      status: { [db.Sequelize.Op.ne]: 'pending' } 
    };

    if (query) {
      whereClause[db.Sequelize.Op.or] = [
        { title: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { skills_gap_suggestion: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { tags: { [db.Sequelize.Op.contains]: [query] } }
      ];
    }

    if (sector) whereClause.sector = sector;
    if (priority) whereClause.priority = priority;

    const { count, rows: insights } = await Insight.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email', 'user_type']
      }],
      order: [['date_created', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      insights,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Search insights error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error searching insights", 
      error: error.message 
    });
  }
};

// GET INSIGHT STATISTICS
export const getInsightStatistics = async (req, res) => {
  try {
    const totalInsights = await Insight.count();
    const insightsByStatus = await Insight.findAll({
      attributes: [
        'status',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('insight_id')), 'count']
      ],
      group: ['status']
    });
    
    const insightsBySector = await Insight.findAll({
      attributes: [
        'sector',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('insight_id')), 'count']
      ],
      group: ['sector'],
      order: [[db.Sequelize.literal('count'), 'DESC']],
      limit: 10
    });

    const insightsByPriority = await Insight.findAll({
      attributes: [
        'priority',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('insight_id')), 'count']
      ],
      group: ['priority']
    });

    res.status(200).json({ 
      success: true, 
      statistics: {
        totalInsights,
        byStatus: insightsByStatus,
        bySector: insightsBySector,
        byPriority: insightsByPriority
      }
    });
  } catch (error) {
    console.error("Get insight statistics error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching insight statistics", 
      error: error.message 
    });
  }
};