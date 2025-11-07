const Sequelize = require("sequelize");
const config = require("../config/config.js");
require("dotenv");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.localhost,
    dialect: "postgres",
  }
);

try {
  sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

module.exports = sequelize;
