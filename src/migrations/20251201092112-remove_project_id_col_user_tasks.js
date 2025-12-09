"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.removeColumn("user_tasks", "project_id");
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.addColumn("user_tasks", "project_id", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "projects",
        key: "id",
      },
    });
  },
};
