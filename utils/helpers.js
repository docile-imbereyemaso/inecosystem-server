import db from '../models/index.js';
const { User, Company, Job, Internship, Insight, Contribution, Certificate, Opportunity } = db;

// Example: Get user with all their companies, jobs, and internships
const getUserWithDetails = async (userId) => {
  return await User.findByPk(userId, {
    include: [
      { model: Company, as: 'companies' },
      { model: Job, as: 'jobs' },
      { model: Internship, as: 'internships' },
      { model: Certificate, as: 'certificates' }
    ]
  });
};

// Example: Get company with all its jobs and internships
const getCompanyWithDetails = async (companyId) => {
  return await Company.findByPk(companyId, {
    include: [
      { model: Job, as: 'jobs' },
      { model: Internship, as: 'internships' },
      { model: User, as: 'owner' }
    ]
  });
};