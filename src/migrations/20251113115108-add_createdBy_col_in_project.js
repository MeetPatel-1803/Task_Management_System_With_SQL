"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn("projects", "created_by", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("projects", "created_by");
  },
};
