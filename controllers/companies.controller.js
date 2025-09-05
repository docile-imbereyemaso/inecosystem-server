import Company from '../models/Company.js';

// CREATE COMPANY
export const createCompany = async (req, res) => {
  try {
    const { name, description, locations, contacts, offerings } = req.body;

    const company = await Company.create({
      name,
      description,
      locations,
      contacts,
      offerings
    });

    res.status(201).json({ 
      success: true, 
      company 
    });
  } catch (error) {
    console.error("Create company error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error creating company", 
      error: error.message 
    });
  }
};

// GET ALL COMPANIES
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ 
      success: true, 
      companies 
    });
  } catch (error) {
    console.error("Get companies error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching companies" 
    });
  }
};

// GET COMPANY BY ID
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findByPk(id);
    
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: "Company not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      company 
    });
  } catch (error) {
    console.error("Get company error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching company" 
    });
  }
};

// UPDATE COMPANY
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updated] = await Company.update(updates, {
      where: { company_id: id }
    });
    
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: "Company not found" 
      });
    }
    
    const updatedCompany = await Company.findByPk(id);
    
    res.status(200).json({ 
      success: true, 
      company: updatedCompany,
      message: "Company updated successfully" 
    });
  } catch (error) {
    console.error("Update company error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error updating company" 
    });
  }
};

// DELETE COMPANY
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Company.destroy({
      where: { company_id: id }
    });
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Company not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Company deleted successfully" 
    });
  } catch (error) {
    console.error("Delete company error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error deleting company" 
    });
  }
};