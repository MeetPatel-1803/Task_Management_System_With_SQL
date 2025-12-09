const { sequelize } = require("../models/index.js");

const getData = async (query, replacements, transaction) => {
  return await sequelize.query(query, {
    replacements,
    type: sequelize.QueryTypes.SELECT,
    ...(transaction && { transaction }),
  });
};

module.exports = {
  getData,
};
