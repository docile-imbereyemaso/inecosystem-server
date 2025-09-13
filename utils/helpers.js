import db from '../models/index.js';
import Notification from '../models/Notification.js';
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


export const createNotification = async ({
  title,
  message,
  recipient_type = 'general',
  recipient_id = null,
  data = null
}) => {
  try {
    // Validate required fields
    if (!title || !message) {
      throw new Error('Title and message are required');
    }

    // Validate recipient_type
    if (recipient_type !== 'user' && recipient_type !== 'general') {
      throw new Error('Recipient type must be either "user" or "general"');
    }

    // Validate recipient_id for user notifications
    if (recipient_type === 'user' && !recipient_id) {
      throw new Error('Recipient ID is required for user notifications');
    }

    // For general notifications, ensure recipient_id is null
    if (recipient_type === 'general') {
      recipient_id = null;
    }

    // Create the notification
    const notification = await Notification.create({
      title,
      message,
      recipient_type,
      recipient_id,
      data,
      is_read: false
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};