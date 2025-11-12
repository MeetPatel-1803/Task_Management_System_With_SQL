const { Project } = require("../models/index.js");
const { internalServerErrorResponse } = require("../utils/response");
const {
  createProjectValidation,
} = require("../validations/projectValidations");

const createProject = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const reqParams = req.body;
    createProjectValidation(reqParams, res, async (validate) => {
      if (validate) {
        console.log("reqParams", reqParams);
        // const project = await Project.create(reqParams);
      }
    });
  } catch (error) {
    console.log("error", error);
    return internalServerErrorResponse(res);
  }
};

module.exports = {
  createProject,
};
