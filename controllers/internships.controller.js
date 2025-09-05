import Internship from '../models/Internship.js';
import User from '../models/User.js';

// CREATE INTERNSHIP (Private sector only)
export const createInternship = async (req, res) => {
  try {
    // Check if user is approved private sector
    if (req.user.user_type !== 'private_sector' || !req.user.is_approved) {
      return res.status(403).json({ 
        success: false, 
        message: "Only approved private sector users can create internships" 
      });
    }

    const { 
      name, type, level, sponsorship, sector, period, 
      application_open, deadline, description, requirements, 
      benefits, location, duration, stipend, skills_required 
    } = req.body;

    // Validation
    if (!name || !type || !level || !sector || !period || !deadline) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, type, level, sector, period, and deadline are required" 
      });
    }

    const internship = await Internship.create({
      name,
      type,
      level,
      sponsorship: sponsorship || false,
      sector,
      period,
      application_open: application_open !== undefined ? application_open : true,
      deadline,
      description,
      requirements,
      benefits,
      location,
      duration,
      stipend,
      skills_required: skills_required || [],
      company_id: req.user.user_id
    });

    // Include company details in response
    const internshipWithCompany = await Internship.findByPk(internship.internship_id, {
      include: [{
        model: User,
        as: 'company',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email']
      }]
    });

    res.status(201).json({ 
      success: true, 
      internship: internshipWithCompany,
      message: "Internship created successfully" 
    });
  } catch (error) {
    console.error("Create internship error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error creating internship", 
      error: error.message 
    });
  }
};

// GET ALL INTERNSHIPS
export const getInternships = async (req, res) => {
  try {
    const { page = 1, limit = 10, sector, type, level, location } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for filters
    const whereClause = { is_active: true };
    
    if (sector) whereClause.sector = sector;
    if (type) whereClause.type = type;
    if (level) whereClause.level = level;
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };

    const { count, rows: internships } = await Internship.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'company',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      internships,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get internships error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching internships", 
      error: error.message 
    });
  }
};

// GET INTERNSHIP BY ID
export const getInternshipById = async (req, res) => {
  try {
    const { id } = req.params;

    const internship = await Internship.findByPk(id, {
      include: [{
        model: User,
        as: 'company',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email', 'phone', 'bio']
      }]
    });

    if (!internship) {
      return res.status(404).json({ 
        success: false, 
        message: "Internship not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      internship 
    });
  } catch (error) {
    console.error("Get internship error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching internship", 
      error: error.message 
    });
  }
};

// GET INTERNSHIPS BY COMPANY (Private sector users)
export const getCompanyInternships = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: internships } = await Internship.findAndCountAll({
      where: { company_id: req.user.user_id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      internships,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get company internships error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching company internships", 
      error: error.message 
    });
  }
};

// UPDATE INTERNSHIP (Only the creator)
export const updateInternship = async (req, res) => {
  try {
    const { id } = req.params;

    const internship = await Internship.findOne({
      where: { internship_id: id, company_id: req.user.user_id }
    });

    if (!internship) {
      return res.status(404).json({ 
        success: false, 
        message: "Internship not found or you don't have permission to update it" 
      });
    }

    await internship.update(req.body);

    const updatedInternship = await Internship.findByPk(id, {
      include: [{
        model: User,
        as: 'company',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email']
      }]
    });

    res.status(200).json({ 
      success: true, 
      internship: updatedInternship,
      message: "Internship updated successfully" 
    });
  } catch (error) {
    console.error("Update internship error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error updating internship", 
      error: error.message 
    });
  }
};

// DELETE INTERNSHIP (Only the creator)
export const deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;

    const internship = await Internship.findOne({
      where: { internship_id: id, company_id: req.user.user_id }
    });

    if (!internship) {
      return res.status(404).json({ 
        success: false, 
        message: "Internship not found or you don't have permission to delete it" 
      });
    }

    // Soft delete by setting is_active to false
    await internship.update({ is_active: false });

    res.status(200).json({ 
      success: true, 
      message: "Internship deleted successfully" 
    });
  } catch (error) {
    console.error("Delete internship error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error deleting internship", 
      error: error.message 
    });
  }
};

// GET INTERNSHIPS BY SECTOR (For individual users)
export const getInternshipsBySector = async (req, res) => {
  try {
    // For individual users, filter by their sectors
    if (req.user.user_type === 'individual' && req.user.sectors && req.user.sectors.length > 0) {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: internships } = await Internship.findAndCountAll({
        where: {
          sector: req.user.sectors,
          is_active: true,
          application_open: true
        },
        include: [{
          model: User,
          as: 'company',
          attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email']
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      return res.status(200).json({ 
        success: true, 
        internships,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      });
    }

    // For other users, return all active internships
    const internships = await Internship.findAll({
      where: { is_active: true },
      include: [{
        model: User,
        as: 'company',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email']
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ 
      success: true, 
      internships 
    });
  } catch (error) {
    console.error("Get internships by sector error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching internships", 
      error: error.message 
    });
  }
};