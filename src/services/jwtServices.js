const Jwt = require("jsonwebtoken");
const { config } = require("dotenv");
config();

const issueUserToken = async (payload) => {
  const token = Jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS512",
    expiresIn: process.env.TOKEN_EXPIRE,
  });
  return token;
};

module.exports = {
  issueUserToken,
};
