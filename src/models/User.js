const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");

const userSchema = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    token_expire: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
    ],
    timestamps: true,
  }
);

module.exports = userSchema;
