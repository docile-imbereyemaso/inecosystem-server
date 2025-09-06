import Company from '../models/Company.js';
import User from '../models/User.js';

// CREATE COMPANY
// export const createCompany = async (req, res) => {
//   try {

    
//     const { name, description, locations, contacts, offerings } = req.body;
//     const myCompany = await User.findByPk(req.user.user_id,{
//       include:[
//         {
//           model:Company,
//           as:"companies"

//         }
//       ]
//     })

//     const company = await Company.create({
//       name,
//       description,
//       locations,
//       contacts,
//       offerings,
//       user_id:req.user.user_id
//     });

//     res.status(201).json({ 
//       success: true, 
//       company 
//     });
//   } catch (error) {
//     console.error("Create company error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error creating company", 
//       error: error.message 
//     });
//   }
// };



export const createCompany = async (req, res) => {
  try {
    const { company_name:name, description, locations, contacts, offerings } = req.body;

    // Fetch the user and include their companies
    const myUser = await User.findByPk(req.user.user_id, {
      include: [
        {
          model: Company,
          as: "companies"
        }
      ]
    });

    if (!myUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let company;

    if (myUser.companies && myUser.companies.length > 0) {
      // User already has a company -> update the first one
      company = myUser.companies[0];
      await company.update({
        name,
        description,
        locations,
        contacts,
        offerings
      });
    } else {
      // No company yet -> create a new one
      company = await Company.create({
        name,
        description,
        locations,
        contacts,
        offerings,
        user_id: req.user.user_id
      });
    }

    res.status(200).json({
      success: true,
      company
    });
  } catch (error) {
    console.error("Create or update company error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating/updating company",
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
    const { id } = req.params.id;
    
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
    let updates = req.body;
     updates.user_id = req.user.user_id
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