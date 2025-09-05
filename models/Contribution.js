import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Contribution = sequelize.define('Contribution', {
  contribution_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author_id: {
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
    type: DataTypes.ENUM('article', 'research', 'tutorial', 'news', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'contributions',
  timestamps: true,
  createdAt: 'date_created',
  updatedAt: 'date_updated'
});

export default Contribution;