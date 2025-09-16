import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Core Info
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
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Account Type
  user_type: {
    type: DataTypes.ENUM('individual', 'private_sector', 'tvet'),
    allowNull: false,
    defaultValue: 'individual'
  },

  // Files
  profile_image: {
    type: DataTypes.STRING, // store file path / Cloudinary URL
    allowNull: true
  },
  resume: {
    type: DataTypes.STRING,
    allowNull: true
  },
  official_document: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Private sector-specific
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

  // Skills & Sectors
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

  // Authentication
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Status / Verification
  status: {
    type: DataTypes.STRING,
    allowNull: true // e.g. student, jobseeker, employed
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // TVET-specific
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
      // Hash password if modified
      if (user.changed('password')) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }

      // Default approval logic
      if (user.user_type === 'private_sector' && user.is_approved === null) {
        user.is_approved = false;
      }

      if (user.user_type === 'tvet') {
        user.is_approved = true;
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.isApproved = function() {
  return this.is_approved;
};

export default User;
