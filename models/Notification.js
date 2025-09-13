import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
  notification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  recipient_type: {
    type: DataTypes.ENUM('user', 'general'),
    allowNull: false,
    defaultValue: 'general'
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: true, 
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data: {
    type: DataTypes.JSON, 
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true
});


export default Notification;