import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'company_name'
  },
  representative: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'company_representative'
  },
  regId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'company_reg_id'
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'company_size'
  },
  focus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  offerings: {
    type: DataTypes.JSONB,   // <-- fixed here
    allowNull: true,
    defaultValue: []
  },
  profileImage: {
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'profile_image'
  },
  legalDocument: {
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'legal_document'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
    defaultValue: 'pending'
  },
  verificationStatus: {
    type: DataTypes.ENUM('unverified', 'verified', 'rejected'),
    defaultValue: 'unverified',
    field: 'verification_status'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  }
}, {
  tableName: 'companies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['company_reg_id'] },
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['verification_status'] }
  ]
});

export default Company;
