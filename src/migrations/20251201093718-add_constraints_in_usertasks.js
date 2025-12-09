"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "user_tasks",
      "user_tasks_task_id_fkey"
    );

    await queryInterface.addConstraint("user_tasks", {
      fields: ["task_id"],
      type: "foreign key",
      name: "user_tasks_task_id_fkey",
      references: {
        table: "tasks",
        field: "id",
      },
      onDelete: "CASCADE", // <- This is the fix
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "user_tasks",
      "user_tasks_task_id_fkey"
    );

    await queryInterface.addConstraint("user_tasks", {
      fields: ["task_id"],
      type: "foreign key",
      name: "user_tasks_task_id_fkey",
      references: {
        table: "tasks",
        field: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    });
  },
};
