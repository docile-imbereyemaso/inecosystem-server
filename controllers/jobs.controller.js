import db from '../models/index.js';
const { Job, User, Company } = db;

// CREATE JOB (Private sector only - approved)
export const createJob = async (req, res) => {
  try {
    // Check if user is approved private sector
    if (req.user.user_type !== 'private_sector' || !req.user.is_approved) {
      return res.status(403).json({ 
        success: false, 
        message: "Only approved private sector users can create jobs" 
      });
    }

    const { 
      name, 
      type, 
      level, 
      positions, 
      period, 
      application_link, 
      skills_required, 
      qualifications, 
      description, 
      requirements, 
      benefits, 
      location, 
      salary_range 
    } = req.body;

    // Validation
    if (!name || !type || !level) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, type, and level are required" 
      });
    }

    const job = await Job.create({
      name,
      type,
      level,
      positions: positions || 1,
      period,
      application_link,
      skills_required: skills_required || [],
      qualifications: qualifications || [],
      description,
      requirements,
      benefits,
      location,
      salary_range,
      company_id: req.user.user_id,
      is_active: true
    });

    // Include company details in response
    const jobWithCompany = await Job.findByPk(job.job_id, {
      include: [{
        model: User,
        as: 'company',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email']
      }]
    });

    res.status(201).json({ 
      success: true, 
      job: jobWithCompany,
      message: "Job created successfully" 
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error creating job", 
      error: error.message 
    });
  }
};

// GET ALL JOBS
export const getJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      level, 
      location,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Build where clause for filters
    const whereClause = { is_active: true };
    
    if (type) whereClause.type = type;
    if (level) whereClause.level = level;
    if (location) whereClause.location = { [db.Sequelize.Op.iLike]: `%${location}%` };

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'company',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching jobs", 
      error: error.message 
    });
  }
};

// GET JOB BY ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      include: [{
        model: User,
        as: 'company',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email', 'bio']
      }]
    });

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: "Job not found" 
      });
    }

    // Only show active jobs to non-owners
    if (!job.is_active && job.company_id !== req.user.user_id) {
      return res.status(403).json({ 
        success: false, 
        message: "This job is no longer available" 
      });
    }

    res.status(200).json({ 
      success: true, 
      job 
    });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching job", 
      error: error.message 
    });
  }
};

// GET COMPANY'S JOBS (Private sector users)
// GET COMPANY'S JOBS (Private sector users)
export const getCompanyJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      is_active 
    } = req.query;
    
    const offset = (page - 1) * limit;

    const whereClause = { company_id: req.user.user_id };
    if (is_active !== undefined) whereClause.is_active = is_active;

    // First get the jobs without including the company
    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Then get company details separately
    const company = await User.findByPk(req.user.user_id, {
      attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email']
    });

    // Combine the data
    const jobsWithCompany = jobs.map(job => {
      return {
        ...job.toJSON(),
        company: company
      };
    });

    res.status(200).json({ 
      success: true, 
      jobs: jobsWithCompany,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get company jobs error:", error);
    res.status(500).json({ 
      success: false, 
      message: `Server error fetching company jobs ${req.user.user_id}`, 
      error: error.message 
    });
  }
};
// UPDATE JOB (Only the creator)
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOne({
      where: { job_id: id, company_id: req.user.user_id }
    });

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: "Job not found or you don't have permission to update it" 
      });
    }

    await job.update(req.body);

    const updatedJob = await Job.findByPk(id, {
      include: [{
        model: User,
        as: 'company',
        attributes: ['user_id', 'first_name', 'last_name', 'company_name', 'email']
      }]
    });

    res.status(200).json({ 
      success: true, 
      job: updatedJob,
      message: "Job updated successfully" 
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error updating job", 
      error: error.message 
    });
  }
};

// TEMPORARY: Hard delete for testing
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOne({
      where: { job_id: id, company_id: req.user.user_id }
    });

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: "Job not found or you don't have permission to delete it" 
      });
    }

    // HARD DELETE for testing
    await job.destroy();

    res.status(200).json({ 
      success: true, 
      message: "Job deleted successfully",
      deleted_job_id: id
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error deleting job", 
      error: error.message 
    });
  }
};
// GET JOBS BY SECTOR (For individual users)
export const getJobsBySector = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const offset = (page - 1) * limit;

    // For individual users, filter by their sectors
    let whereClause = { is_active: true };
    
    if (req.user.user_type === 'individual' && req.user.sectors && req.user.sectors.length > 0) {
      // Assuming sectors are stored in user profile and jobs have a sector field
      whereClause.sector = req.user.sectors;
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
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
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get jobs by sector error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching jobs by sector", 
      error: error.message 
    });
  }
};

// SEARCH JOBS
export const searchJobs = async (req, res) => {
  try {
    const { 
      query, 
      page = 1, 
      limit = 10,
      type,
      level,
      location
    } = req.query;
    
    const offset = (page - 1) * limit;

    const whereClause = { 
      is_active: true 
    };

    if (query) {
      whereClause[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { description: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { skills_required: { [db.Sequelize.Op.contains]: [query] } }
      ];
    }

    if (type) whereClause.type = type;
    if (level) whereClause.level = level;
    if (location) whereClause.location = { [db.Sequelize.Op.iLike]: `%${location}%` };

    const { count, rows: jobs } = await Job.findAndCountAll({
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
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Search jobs error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error searching jobs", 
      error: error.message 
    });
  }
};