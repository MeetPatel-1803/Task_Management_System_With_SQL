const { META_CODE } = require("../utils/constants.js");
const { getData } = require("../utils/dbHelper.js");
const {
  internalServerErrorResponse,
  successResponseData,
  errorResponseWithoutData,
} = require("../utils/response.js");

const userProfile = async (req, res) => {
  try {
    const userId = req.authUser.id;
    const query =
      "SELECT users.id, users.name, users.email, users.role, users.profile_picture, users.phone_number FROM users WHERE id = :userId";
    const replacements = {
      userId,
    };

    const userData = await getData(query, replacements);

    if (userData && userData.length) {
      return successResponseData(
        res,
        userData[0],
        META_CODE.SUCCESS,
        res.__("userProfile")
      );
    } else {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("noUserFound")
      );
    }
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const listUserProjects = async (req, res) => {
  try {
    const userId = req.params.id;
    const query = `SELECT projects.*, users.name, users.profile_picture, users.role, creator.name AS created_by FROM user_projects INNER JOIN users ON user_projects.user_id = users.id INNER JOIN projects ON user_projects.project_id = projects.id LEFT JOIN users AS creator ON projects.created_by = creator.id WHERE user_projects.user_id = :userId`;
    const replacements = {
      userId,
    };

    const userProjects = await getData(query, replacements);

    if (userProjects && userProjects.length) {
      return successResponseData(
        res,
        userProjects,
        META_CODE.SUCCESS,
        res.__("projectsList")
      );
    } else {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("noProjectsFound")
      );
    }
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

module.exports = {
  userProfile,
  listUserProjects,
};
