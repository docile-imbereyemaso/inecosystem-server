import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Connection = sequelize.define('Connection', {
  connection_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  connected_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'connections',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'connected_user_id']
    }
  ]
});

// Associations

export default Connection;