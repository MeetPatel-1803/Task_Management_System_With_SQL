const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");
const { TASK } = require("../utils/constants.js");

const taskSchema = sequelize.define(
  "tasks",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_by: {
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
    status: {
      type: DataTypes.ENUM(Object.values(TASK.STATUS)),
      allowNull: false,
      defaultValue: TASK.STATUS.OPEN,
    },
    priority: {
      type: DataTypes.ENUM(Object.values(TASK.PRIORITY)),
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = taskSchema;
