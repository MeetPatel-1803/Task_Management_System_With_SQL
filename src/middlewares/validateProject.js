const { Project } = require("../models/index.js");
const { RESPONSE_CODE } = require("../utils/constants");
const {
  errorResponseWithoutData,
  internalServerErrorResponse,
} = require("../utils/response.js");

const validateProject = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;

    const project = await Project.findOne({ where: { id: projectId } });

    if (!project) {
      return errorResponseWithoutData(
        res,
        RESPONSE_CODE.NOT_FOUND,
        res.__("projectNotFound")
      );
    }

    req.projectId = project;
    next();
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

module.exports = validateProject;
