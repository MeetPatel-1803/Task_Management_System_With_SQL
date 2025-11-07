const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");
const { PROJECT_STATUS } = require("../utils/constants.js");

const projectSchema = sequelize.define(
  "projects",
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
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(Object.values(PROJECT_STATUS)),
      allowNull: false,
      defaultValue: PROJECT_STATUS.IN_DEVELOPMENT,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = projectSchema;
