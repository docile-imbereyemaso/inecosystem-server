import User from '../models/User.js';
import Job from '../models/Job.js';
import Insight from '../models/Insight.js';
import { Op } from 'sequelize';


// APPROVE PRIVATE SECTOR USER (TVET only)
export const approvePrivateSectorUser = async (req, res) => {
  try {
    // Check if user is TVET admin
    if (req.user.user_type !== 'tvet') {
      return res.status(403).json({ 
        success: false, 
        message: "Only TVET administrators can approve private sector users" 
      });
    }

    const { userId } = req.params;

    const user = await User.findOne({
      where: { user_id: userId, user_type: 'private_sector' }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Private sector user not found" 
      });
    }

    await user.update({ is_approved: true });

    res.status(200).json({ 
      success: true, 
      message: "User approved successfully" 
    });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error approving user", 
      error: error.message 
    });
  }
};

// GET PENDING APPROVALS (TVET only)
export const getPendingApprovals = async (req, res) => {
  try {
    // Check if user is TVET admin
    if (req.user.user_type !== 'tvet') {
      return res.status(403).json({ 
        success: false, 
        message: "Only TVET administrators can view pending approvals" 
      });
    }

    const pendingUsers = await User.findAll({
      where: { user_type: 'private_sector', is_approved: false },
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({ 
      success: true, 
      users: pendingUsers 
    });
  } catch (error) {
    console.error("Get pending approvals error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching pending approvals", 
      error: error.message 
    });
  }
};





export const getAll = async (req, res) => {
  try {
    // Check if user is TVET admin
    if (req.user.user_type !== 'tvet') {
      return res.status(403).json({ 
        success: false, 
        message: "Only TVET administrators can view all private_sectors" 
      });
    }

    const allPrivateSectors = await User.findAll({
      where: { user_type: 'private_sector' },
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({ 
      success: true, 
      users: allPrivateSectors 
    });
  } catch (error) {
    console.error("Get all private sectors error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching all private sectors", 
      error: error.message 
    });
  }
};



export const getPrivateSectorByStatus = async (req, res) => {
  try {
    // ✅ Only TVET admins can access
    if (req.user.user_type !== "tvet") {
      return res.status(403).json({
        success: false,
        message: "Only TVET administrators can view private sector users",
      });
    }

    // ✅ Optional filter from query: ?status=registered or ?status=pending
    const { status } = req.query;

    let filter = {};
    if (status === "registered") {
      filter = { is_approved: true };
    } else if (status === "pending") {
      filter = { is_approved: false };
    }

    // ✅ Fetch only private sector users
    const privateSectors = await User.findAll({
      where: {
        user_type: "private_sector", // only private sector
        ...filter,                   // apply approval filter
      },
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({
      success: true,
      users: privateSectors,
    });
  } catch (error) {
    console.error("Get private sector by status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching private sector users",
      error: error.message,
    });
  }
};



export const getAllUsers = async (req, res) => {
  try {
    // Optional: Check if user is TVET admin
    if (req.user.user_type !== 'tvet') {
      return res.status(403).json({ 
        success: false, 
        message: "Only TVET administrators can view all users" 
      });
    }

    // Fetch all users excluding TVET
    const allUsers = await User.findAll({
      where: {
        user_type: {
          [Op.ne]: 'tvet'  // Not equal to 'tvet'
        }
      },
      attributes: { exclude: ['password'] } // Exclude passwords for security
    });

    res.status(200).json({ 
      success: true, 
      users: allUsers 
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching all users", 
      error: error.message 
    });
  }
};



// ADD COMMENT TO INSIGHT (TVET only)
export const addInsightComment = async (req, res) => {
  try {
    // Check if user is TVET admin
    if (req.user.user_type !== 'tvet') {
      return res.status(403).json({ 
        success: false, 
        message: "Only TVET administrators can add comments to insights" 
      });
    }

    const { insightId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ 
        success: false, 
        message: "Comment is required" 
      });
    }

    const insight = await Insight.findByPk(insightId);
    if (!insight) {
      return res.status(404).json({ 
        success: false, 
        message: "Insight not found" 
      });
    }

    // Get existing comments or initialize empty array
    const comments = insight.comments || [];
    
    // Add new comment with user info and timestamp
    comments.push({
      user_id: req.user.user_id,
      user_name: `${req.user.first_name} ${req.user.last_name}`,
      comment,
      timestamp: new Date()
    });

    await insight.update({ comments });

    res.status(200).json({ 
      success: true, 
      message: "Comment added successfully" 
    });
  } catch (error) {
    console.error("Add insight comment error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error adding comment", 
      error: error.message 
    });
  }
};

// GET STATISTICS (TVET only)
export const getStatistics = async (req, res) => {
  try {
    // Check if user is TVET admin
    if (req.user.user_type !== 'tvet') {
      return res.status(403).json({ 
        success: false, 
        message: "Only TVET administrators can view statistics" 
      });
    }

    const userCounts = await User.findAll({
      attributes: [
        'user_type',
        [User.sequelize.fn('COUNT', User.sequelize.col('user_id')), 'count']
      ],
      group: ['user_type']
    });

    const jobCount = await Job.count();
    const insightCount = await Insight.count();
    const pendingApprovalCount = await User.count({
      where: { user_type: 'private_sector', is_approved: false }
    });

    res.status(200).json({ 
      success: true, 
      statistics: {
        userCounts,
        jobCount,
        insightCount,
        pendingApprovalCount
      }
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching statistics", 
      error: error.message 
    });
  }
};