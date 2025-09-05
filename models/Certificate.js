import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
// Associations
import User from './User.js';
const Certificate = sequelize.define('Certificate', {
  certificate_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issuing_organization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  certificate_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issue_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  credential_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'certificates',
  timestamps: true
});


// Certificate.belongsTo(User, { foreignKey: 'user_id' });
// User.hasMany(Certificate, { foreignKey: 'user_id' });

export default Certificate;