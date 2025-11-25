"use strict";

const { USER_ROLES } = require("../utils/constants.js");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn("users", "role", {
      type: Sequelize.ENUM(Object.values(USER_ROLES)),
      allowNull: false,
      defaultValue: USER_ROLES.EMPLOYEE,
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("users", "role");
  },
};
