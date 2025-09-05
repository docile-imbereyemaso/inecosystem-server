import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Opportunity = sequelize.define('Opportunity', {
  opportunity_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('scholarship', 'grant', 'competition', 'workshop', 'training'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  eligibility: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  application_deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  application_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  requirements: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'opportunities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Opportunity;