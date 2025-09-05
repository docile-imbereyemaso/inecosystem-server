import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  user_type: {
    type: DataTypes.ENUM('individual', 'private_sector', 'tvet'),
    allowNull: false,
    defaultValue: 'individual'
  },
  // For private_sector users
  company_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  company_size: {
    type: DataTypes.STRING,
    allowNull: true
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // For all users
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  sectors: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Approval status for private_sector users
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // For tvet users
  tvet_institution: {
    type: DataTypes.STRING,
    allowNull: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
      
      // Private sector users need approval
      if (user.user_type === 'private_sector' && user.is_approved === null) {
        user.is_approved = false;
      }
      
      // TVET users are automatically approved (added by DBA)
      if (user.user_type === 'tvet') {
        user.is_approved = true;
      }
    }
  }
});

// Instance method to check password
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Instance method to check if user is approved
User.prototype.isApproved = function() {
  return this.is_approved;
};

export default User;