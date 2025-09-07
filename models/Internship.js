import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Internship = sequelize.define('Internship', {
  internship_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }, 
   company_id: {
    type: DataTypes.INTEGER, // This should match the users table primary key type
    allowNull: false,
    references: {
      model: 'users', // Name of the table
      key: 'user_id'  // Name of the column in users table
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'remote'),
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('entry', 'junior', 'mid', 'senior'),
    allowNull: false
  },
  sponsorship: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sector: {
    type: DataTypes.STRING,
    allowNull: false
  },
  period: {
    type: DataTypes.STRING,
    allowNull: false
  },
  application_open: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stipend: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  skills_required: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'internships',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
// import User from './User.js';
// Internship.belongsTo(User, { 
//   foreignKey: 'company_id',
//   as: 'company'
// });
// User.hasMany(Internship, { 
//   foreignKey: 'company_id',
//   as: 'internships'
// });

export default Internship;