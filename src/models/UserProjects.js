const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");

const userProjectSchema = sequelize.define(
  "user_projects",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "projects",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = userProjectSchema;
