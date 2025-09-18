import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Blog = sequelize.define(
  "Blog",
  {
    // Primary Key
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Reference to company (private sector user)
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Blog content
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    coverImage: {
      type: DataTypes.STRING, // URL or path to image
      allowNull: true,
    },

    // Tags and category
    tags: {
      type: DataTypes.JSON, // stores array of strings
      defaultValue: [],
    },
    category: {
      type: DataTypes.ENUM("career", "skills", "market", "internships", "technology"),
      defaultValue: "career",
    },

    // Status & visibility
    status: {
      type: DataTypes.ENUM("draft", "published", "archived"),
      defaultValue: "draft",
    },

    viewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "blogs",
    timestamps: true,
    hooks: {
      beforeCreate: (blog) => {
      
        if (!Array.isArray(blog.tags)) {
          blog.tags = [];
        }
      },
      beforeUpdate: (blog) => {
        // Ensure views and likes are not negative
        if (blog.viewsCount < 0) blog.viewsCount = 0;
        if (blog.likesCount < 0) blog.likesCount = 0;
      },
    },
  }
);

// Instance methods
Blog.prototype.incrementViews = async function () {
  this.viewsCount += 1;
  await this.save();
};

Blog.prototype.incrementLikes = async function () {
  this.likesCount += 1;
  await this.save();
};

Blog.prototype.decrementLikes = async function () {
  if (this.likesCount > 0) {
    this.likesCount -= 1;
    await this.save();
  }
};

export default Blog;
