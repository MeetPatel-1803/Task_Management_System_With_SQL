const Jwt = require("jsonwebtoken");
const { config } = require("dotenv");
config();

const issueUserToken = async (payload) => {
  const token = Jwt.sign(payload, "tms1234", {
    algorithm: "HS512",
    expiresIn: process.env.TOKEN_EXPIRE,
  });
  return token;
};

const decode = (token) => {
  const parts = token.split(" ");
  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];
    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    }

    return false;
  }

  return false;
};

const verifyUser = (token) => {
  try {
    return Jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return false;
  }
};

module.exports = {
  issueUserToken,
  decode,
  verifyUser,
};
