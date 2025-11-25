const { USER_ROLES, RESPONSE_CODE } = require("../utils/constants.js");
const { errorResponseWithoutData } = require("../utils/response.js");

const userAccess = async (req, res, next) => {
  try {
    let role;
    switch (true) {
      case req._parsedUrl.pathname.startsWith("/project"):
        role = req.authUser.role;
        break;
    }
    if (role) {
      if (role !== USER_ROLES.PM && req.method === "POST") {
        // Only PMs can create projects.
        return errorResponseWithoutData(
          res,
          RESPONSE_CODE.FORBIDDEN,
          res.__("accessDenied")
        );
      } else {
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

module.exports = { userAccess };
