const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");

const userPasswordResetTokenSchema = sequelize.define(
  "user_password_reset_tokens",
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
    token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = userPasswordResetTokenSchema;
