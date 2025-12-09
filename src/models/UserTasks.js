const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");

const userTaskSchema = sequelize.define(
  "user_tasks",
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
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tasks",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

// User.belongsToMany(Task, { through: userTaskSchema });
// Task.belongsToMany(User, { through: userTaskSchema });

module.exports = userTaskSchema;
