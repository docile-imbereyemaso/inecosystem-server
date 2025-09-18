import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Blog from "./Blog.js";

const BlogComment = sequelize.define(
  "BlogComment",
  {
    // Primary Key
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Reference to the blog
    blogId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Reference to the student (user)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Comment content
    comment: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
  },
  {
    tableName: "blog_comments",
    timestamps: true,
    hooks: {
      beforeCreate: (c) => {
        // Ensure comment is not empty
        if (!c.comment || !c.comment.trim()) {
          throw new Error("Comment cannot be empty");
        }
      },
    },
  }
);


export default BlogComment;
