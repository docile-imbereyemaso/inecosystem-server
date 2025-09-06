import db from '../models/index.js';
const { User, Connection, Company, Job, Internship, Certificate } = db;

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own profile or public profiles
    const isOwnProfile = parseInt(userId) === req.user.user_id;
    
    const user = await User.findByPk(userId, {
      attributes: { 
        exclude: isOwnProfile ? [] : ['password', 'email', 'phone'] 
      },
      include: [
        {
          model: Certificate,
          as: 'certificates',
          attributes: ['certificate_id', 'name', 'issuing_organization', 'certificate_type', 'issue_date']
        },
        {
          model: Company,
          as: 'companies',
      
          where: isOwnProfile ? {} : { is_verified: true },
          required: false
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Private sector users can hide some details from non-connections
    if (user.user_type === 'private_sector' && !isOwnProfile) {
      // Check if users are connected
      const connection = await Connection.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { user_id: req.user.user_id, connected_user_id: userId, status: 'accepted' },
            { user_id: userId, connected_user_id: req.user.user_id, status: 'accepted' }
          ]
        }
      });
      
      if (!connection) {
        // Remove sensitive information for non-connected users
        delete user.dataValues.email;
        delete user.dataValues.phone;
        delete user.dataValues.company_name;
      }
    }
    
    res.status(200).json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching user profile" 
    });
  }
};

// UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Ensure users can only update their own profile
    if (req.user.user_id !== parseInt(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to update this profile" 
      });
    }
    
    // Remove restricted fields from updates
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'bio', 'skills', 'sectors',
      'company_name', 'company_size', 'industry', 'tvet_institution', 'position'
    ];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    // Private sector users cannot change their company name after approval
    if (req.user.user_type === 'private_sector' && req.user.is_approved && updates.company_name) {
      if (updates.company_name !== req.user.company_name) {
        return res.status(400).json({ 
          success: false, 
          message: "Cannot change company name after approval" 
        });
      }
    }
    
    const [updated] = await User.update(filteredUpdates, {
      where: { user_id: userId },
      returning: true,
      individualHooks: true
    });
    
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json({ 
      success: true, 
      user: updatedUser,
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error updating profile" 
    });
  }
};

// GET USER CONNECTIONS
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status = 'accepted', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // Users can only view their own connections
    if (req.user.user_id !== parseInt(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view these connections" 
      });
    }
    
    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Must be 'pending', 'accepted', or 'rejected'" 
      });
    }
    
    const { count, rows: connections } = await Connection.findAndCountAll({
      where: {
        user_id: userId,
        status: status
      },
      include: [{
        model: User,
        as: 'connected_user',
        attributes: ['user_id', 'first_name', 'last_name', 'user_type', 'company_name', 'tvet_institution']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.status(200).json({ 
      success: true, 
      connections,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get user connections error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching connections" 
    });
  }
};

// ADD CONNECTION (Send connection request)
export const addConnection = async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;
    
    // Users can only send connection requests from their own account
    if (req.user.user_id !== parseInt(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to send connection requests" 
      });
    }
    
    // Cannot connect to oneself
    if (parseInt(userId) === parseInt(targetUserId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot connect to yourself" 
      });
    }
    
    // Check if target user exists
    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: "Target user not found" 
      });
    }
    
    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { user_id: userId, connected_user_id: targetUserId },
          { user_id: targetUserId, connected_user_id: userId }
        ]
      }
    });
    
    if (existingConnection) {
      return res.status(409).json({ 
        success: false, 
        message: "Connection already exists",
        status: existingConnection.status 
      });
    }
    
    // Create new connection request
    const connection = await Connection.create({
      user_id: userId,
      connected_user_id: targetUserId,
      status: 'pending'
    });
    
    res.status(201).json({ 
      success: true, 
      connection,
      message: "Connection request sent successfully" 
    });
  } catch (error) {
    console.error("Add connection error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error sending connection request" 
    });
  }
};

// ACCEPT CONNECTION REQUEST
export const acceptConnection = async (req, res) => {
  try {
    const { userId, requestId } = req.params;
    
    // Users can only accept their own connection requests
    if (req.user.user_id !== parseInt(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to accept this connection" 
      });
    }
    
    const connection = await Connection.findOne({
      where: {
        connection_id: requestId,
        connected_user_id: userId,
        status: 'pending'
      }
    });
    
    if (!connection) {
      return res.status(404).json({ 
        success: false, 
        message: "Connection request not found" 
      });
    }
    
    await connection.update({ status: 'accepted' });
    
    res.status(200).json({ 
      success: true, 
      connection,
      message: "Connection request accepted" 
    });
  } catch (error) {
    console.error("Accept connection error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error accepting connection" 
    });
  }
};

// REJECT CONNECTION REQUEST
export const rejectConnection = async (req, res) => {
  try {
    const { userId, requestId } = req.params;
    
    // Users can only reject their own connection requests
    if (req.user.user_id !== parseInt(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to reject this connection" 
      });
    }
    
    const connection = await Connection.findOne({
      where: {
        connection_id: requestId,
        connected_user_id: userId,
        status: 'pending'
      }
    });
    
    if (!connection) {
      return res.status(404).json({ 
        success: false, 
        message: "Connection request not found" 
      });
    }
    
    await connection.update({ status: 'rejected' });
    
    res.status(200).json({ 
      success: true, 
      message: "Connection request rejected" 
    });
  } catch (error) {
    console.error("Reject connection error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error rejecting connection" 
    });
  }
};

// REMOVE CONNECTION
export const removeConnection = async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;
    
    // Users can only remove their own connections
    if (req.user.user_id !== parseInt(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to remove this connection" 
      });
    }
    
    const connection = await Connection.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { user_id: userId, connected_user_id: targetUserId },
          { user_id: targetUserId, connected_user_id: userId }
        ]
      }
    });
    
    if (!connection) {
      return res.status(404).json({ 
        success: false, 
        message: "Connection not found" 
      });
    }
    
    await connection.destroy();
    
    res.status(200).json({ 
      success: true, 
      message: "Connection removed successfully" 
    });
  } catch (error) {
    console.error("Remove connection error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error removing connection" 
    });
  }
};

// GET USER STATISTICS
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own stats
    if (req.user.user_id !== parseInt(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view these statistics" 
      });
    }
    
    const user = await User.findByPk(userId);
    
    let stats = {};
    
    if (user.user_type === 'individual') {
      const [certificateCount, connectionCount] = await Promise.all([
        Certificate.count({ where: { user_id: userId } }),
        Connection.count({ 
          where: { 
            [db.Sequelize.Op.or]: [
              { user_id: userId, status: 'accepted' },
              { connected_user_id: userId, status: 'accepted' }
            ]
          } 
        })
      ]);
      
      stats = { certificateCount, connectionCount };
      
    } else if (user.user_type === 'private_sector') {
      const [jobCount, internshipCount, connectionCount] = await Promise.all([
        Job.count({ where: { company_id: userId, is_active: true } }),
        Internship.count({ where: { company_id: userId, is_active: true } }),
        Connection.count({ 
          where: { 
            [db.Sequelize.Op.or]: [
              { user_id: userId, status: 'accepted' },
              { connected_user_id: userId, status: 'accepted' }
            ]
          } 
        })
      ]);
      
      stats = { jobCount, internshipCount, connectionCount };
      
    } else if (user.user_type === 'tvet') {
      const [insightCommentCount, connectionCount] = await Promise.all([
        // Count would be based on your insight comment implementation
        0, // Placeholder
        Connection.count({ 
          where: { 
            [db.Sequelize.Op.or]: [
              { user_id: userId, status: 'accepted' },
              { connected_user_id: userId, status: 'accepted' }
            ]
          } 
        })
      ]);
      
      stats = { insightCommentCount, connectionCount };
    }
    
    res.status(200).json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching user statistics" 
    });
  }
};

// SEARCH USERS
export const searchUsers = async (req, res) => {
  try {
    const { 
      query, 
      user_type, 
      sector, 
      skills,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (query) {
      whereClause[db.Sequelize.Op.or] = [
        { first_name: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { last_name: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { company_name: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { tvet_institution: { [db.Sequelize.Op.iLike]: `%${query}%` } }
      ];
    }
    
    if (user_type) whereClause.user_type = user_type;
    if (sector) whereClause.sectors = { [db.Sequelize.Op.contains]: [sector] };
    if (skills) whereClause.skills = { [db.Sequelize.Op.contains]: Array.isArray(skills) ? skills : [skills] };
    
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password', 'email', 'phone'] },
      order: [['first_name', 'ASC'], ['last_name', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.status(200).json({ 
      success: true, 
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error searching users" 
    });
  }
};

// GET CONNECTED USERS (Mutual connections)
export const getConnectedUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // Users can only view their own connections
    if (req.user.user_id !== parseInt(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view these connections" 
      });
    }
    
    const { count, rows: connections } = await Connection.findAndCountAll({
      where: {
        [db.Sequelize.Op.or]: [
          { user_id: userId, status: 'accepted' },
          { connected_user_id: userId, status: 'accepted' }
        ]
      },
      include: [{
        model: User,
        as: 'connected_user',
        attributes: ['user_id', 'first_name', 'last_name', 'user_type', 'company_name', 'tvet_institution']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.status(200).json({ 
      success: true, 
      connections,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get connected users error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching connected users" 
    });
  }
};

// GET PENDING CONNECTION REQUESTS
export const getPendingConnections = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // Users can only view their own pending requests
    if (req.user.user_id !== parseInt(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view these requests" 
      });
    }
    
    const { count, rows: connections } = await Connection.findAndCountAll({
      where: {
        connected_user_id: userId,
        status: 'pending'
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'first_name', 'last_name', 'user_type', 'company_name', 'tvet_institution']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.status(200).json({ 
      success: true, 
      connections,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get pending connections error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching pending connections" 
    });
  }
};