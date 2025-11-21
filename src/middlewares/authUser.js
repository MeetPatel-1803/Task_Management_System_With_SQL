const {
  errorResponseWithoutData,
  internalServerErrorResponse,
} = require("../utils/response.js");
const { RESPONSE_CODE } = require("../utils/constants.js");
const { decode, verifyUser } = require("../services/jwtServices.js");
const { User } = require("../models/index.js");

const userAuthToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return errorResponseWithoutData(
        res,
        RESPONSE_CODE.UNAUTHORIZED,
        res.__("authorizationError")
      );
    }
    const tokenData = await decode(token);
    if (!tokenData) {
      return errorResponseWithoutData(
        res,
        RESPONSE_CODE.UNAUTHORIZED,
        res.__("authorizationError")
      );
    }
    const decoded = await verifyUser(tokenData);
    if (decoded.id) {
      const result = await User.findByPk(decoded.id, {
        attributes: ["id", "name", "email", "phone_number", "role"],
        raw: true,
      });

      if (!result) {
        return errorResponseWithoutData(
          res,
          RESPONSE_CODE.UNAUTHORIZED,
          res.__("authorizationError")
        );
      }

      req.authUser = result;

      next();
    } else {
      return errorResponseWithoutData(
        res,
        RESPONSE_CODE.UNAUTHORIZED,
        res.__("invalidToken")
      );
    }
  } catch (error) {
    return internalServerErrorResponse(error);
  }
};

module.exports = {
  userAuthToken,
};
