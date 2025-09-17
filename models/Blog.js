// models/Blog.js
module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define("Blog", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    coverImage: {
      type: DataTypes.STRING,
    },
    tags: {
      type: DataTypes.JSON, // stores array of strings
      defaultValue: [],
    },
    category: {
      type: DataTypes.ENUM("career", "skills", "market", "internships", "technology"),
      defaultValue: "career",
    },
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
  });

  Blog.associate = (models) => {
    Blog.belongsTo(models.Company, { foreignKey: "companyId" });
    Blog.hasMany(models.BlogComment, { foreignKey: "blogId" });
  };

  return Blog;
};
