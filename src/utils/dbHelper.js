const { sequelize } = require("../models/index.js");

const getData = async (query, replacements) => {
  return await sequelize.query(query, {
    replacements,
    type: sequelize.QueryTypes.SELECT,
  });
};

module.exports = {
  getData,
};
