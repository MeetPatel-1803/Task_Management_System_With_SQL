// "use strict";

// const fs = require("fs");
// const path = require("path");
// const Sequelize = require("sequelize");
// const process = require("process");
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + "/../config/config.js");
// const db = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(
//     config.database,
//     config.username,
//     config.password,
//     config
//   );
// }

// fs.readdirSync(__dirname)
//   .filter((file) => {
//     return (
//       file.indexOf(".") !== 0 &&
//       file !== basename &&
//       file.slice(-3) === ".js" &&
//       file.indexOf(".test.js") === -1
//     );
//   })
//   .forEach((file) => {
//     const model = require(path.join(__dirname, file))(
//       sequelize,
//       Sequelize.DataTypes
//     );
//     db[model.name] = model;
//   });

// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;
const sequelize = require("../../config/database.js");

// Import models
const User = require("./User.js");
const Project = require("./Project.js");
const Task = require("./Task.js");
const UserTask = require("./UserTasks.js");
const UserPasswordResets = require("./UserPasswordResetToken.js");
const UserProject = require("./UserProjects.js");

// Define associations

UserTask.belongsTo(User, {
  foreignKey: "user_id",
});

Task.hasMany(UserTask, {
  foreignKey: "task_id",
  onDelete: "CASCADE", // ensures dependent UserTasks are deleted
});

UserTask.belongsTo(Task, {
  foreignKey: "task_id",
});

Task.belongsTo(Project, {
  foreignKey: "project_id",
  onDelete: "CASCADE",
});

Project.hasMany(Task, {
  foreignKey: "project_id",
});

Task.belongsTo(User, {
  foreignKey: "created_by",
});

Project.belongsTo(User, {
  foreignKey: "created_by",
});

Project.belongsToMany(User, {
  through: "user_projects",
  foreignKey: "project_id",
  otherKey: "user_id",
  as: "users",
});

User.belongsToMany(Project, {
  through: UserProject,
  foreignKey: "user_id",
  otherKey: "project_id",
  as: "projects",
});

// Export everything together
module.exports = {
  sequelize,
  User,
  Project,
  Task,
  UserTask,
  UserPasswordResets,
  UserProject,
};
