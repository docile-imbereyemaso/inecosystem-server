import sequelize from '../config/database.js';
import User from './User.js';
import Company from './Company.js';
import Job from './Job.js';
import Internship from './Internship.js';
import Insight from './Insight.js';
import Contribution from './Contribution.js';
import Certificate from './Certificate.js';
import Opportunity from './Opportunity.js';
import Connection from './Connection.js';
import Notification from './Notification.js';

// Define all associations
const defineAssociations = () => {
  // User Associations
  User.hasMany(Company, {
    foreignKey: 'user_id',
    as: 'companies'
  });

  User.hasMany(Job, {
    foreignKey: 'created_by',
    as: 'jobs'
  });

  User.hasMany(Insight, {
    foreignKey: 'created_by',
    as: 'insights'
  });

  User.hasMany(Contribution, {
    foreignKey: 'author_id',
    as: 'contributions'
  });

  User.hasMany(Certificate, {
    foreignKey: 'user_id',
    as: 'certificates'
  });

  User.hasMany(Opportunity, {
    foreignKey: 'created_by',
    as: 'opportunities'
  });
// A connection belongs to the user who initiated it
Connection.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// A connection also belongs to the user who is being connected to
Connection.belongsTo(User, {
  foreignKey: 'connected_user_id',
  as: 'connected_user'
});

// A user can have many outgoing connection requests
User.hasMany(Connection, {
  foreignKey: 'user_id',
  as: 'connections'
});

// A user can also have many incoming connection requests
User.hasMany(Connection, {
  foreignKey: 'connected_user_id',
  as: 'connected_to'
});

  // Company Associations
  Company.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'owner'
  });

  Company.hasMany(Job, {
    foreignKey: 'company_id',
    as: 'jobs'
  });

  Company.hasMany(Internship, {
    foreignKey: 'company_id',
    as: 'internships'
  });

  // Job Associations
  Job.belongsTo(Company, {
    foreignKey: 'company_id',
    as: 'company'
  });

  // Internship Associations
  Internship.belongsTo(Company, {
    foreignKey: 'company_id',
    as: 'company'
  });

  // Insight Associations
  Insight.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'author'
  });

  // Contribution Associations
  Contribution.belongsTo(User, {
    foreignKey: 'author_id',
    as: 'author'
  });

  // Certificate Associations
  Certificate.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Opportunity Associations
  Opportunity.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  });
  User.hasMany(Notification, { foreignKey: 'recipient_id', as: 'notifications' });
  Notification.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });

};


// Initialize associations
defineAssociations();

const db = {
  sequelize,
  User,
  Company,
  Job,
  Internship,
  Insight,
  Contribution,
  Certificate,
  Opportunity,
  Connection,
  Notification

};

export default db;
