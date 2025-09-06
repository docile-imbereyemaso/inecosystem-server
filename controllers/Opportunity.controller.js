import Opportunity from '../models/Opportunity.js';

// Get all opportunities (visible to everyone)
export const getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.findAll({
      where: { is_active: true }, // only show active opportunities
      order: [['application_deadline', 'ASC']],
    });

    res.status(200).json({ success: true, opportunities });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching opportunities", 
      error: error.message 
    });
  }
};

// Get single opportunity by ID (visible to everyone)
export const getOpportunityById = async (req, res) => {
  const { id } = req.params;
  try {
    const opportunity = await Opportunity.findByPk(id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    res.status(200).json({ success: true, opportunity });
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    res.status(500).json({ success: false, message: "Server error fetching opportunity", error: error.message });
  }
};

// Create new opportunity (restricted to TVET/admin)
export const createOpportunity = async (req, res) => {
  try {
    if (!['tvet', 'admin'].includes(req.user.user_type)) {
      return res.status(403).json({ success: false, message: "Not authorized to create opportunities" });
    }

    const {
      title,
      type,
      description,
      eligibility,
      benefits,
      application_deadline,
      application_link,
      value,
      duration,
      location,
      requirements,
      tags,
      is_active,
    } = req.body;

    // Validate required fields
    if (!title || !type || !description || !application_deadline) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Validate type ENUM
    const validTypes = ['scholarship', 'grant', 'competition', 'workshop', 'training'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    const newOpportunity = await Opportunity.create({
      created_by: req.user.user_id,
      title,
      type,
      description,
      eligibility: eligibility || null,
      benefits: benefits || null,
      application_deadline,
      application_link: application_link || null,
      value: value || null,
      duration: duration || null,
      location: location || null,
      requirements: Array.isArray(requirements) ? requirements : [],
      tags: Array.isArray(tags) ? tags : [],
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json({ success: true, opportunity: newOpportunity });
  } catch (error) {
    console.error("Error creating opportunity:", error);
    res.status(500).json({ success: false, message: "Server error creating opportunity", error: error.message });
  }
};


// Update opportunity (restricted to creator/admin)
export const updateOpportunity = async (req, res) => {
  const { id } = req.params;
  try {
    const opportunity = await Opportunity.findByPk(id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    if (req.user.user_type !== 'admin' && req.user.user_id !== opportunity.created_by) {
      return res.status(403).json({ success: false, message: "Not authorized to update this opportunity" });
    }

    await opportunity.update(req.body);
    res.status(200).json({ success: true, opportunity });
  } catch (error) {
    console.error("Error updating opportunity:", error);
    res.status(500).json({ success: false, message: "Server error updating opportunity", error: error.message });
  }
};

// Delete opportunity (restricted to creator/admin)
export const deleteOpportunity = async (req, res) => {
  const { id } = req.params;
  try {
    const opportunity = await Opportunity.findByPk(id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    if (req.user.user_type !== 'admin' && req.user.user_id !== opportunity.created_by) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this opportunity" });
    }

    await opportunity.destroy();
    res.status(200).json({ success: true, message: "Opportunity deleted successfully" });
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    res.status(500).json({ success: false, message: "Server error deleting opportunity", error: error.message });
  }
};
