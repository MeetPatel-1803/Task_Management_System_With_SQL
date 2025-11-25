const joi = require("joi");
const { PROJECT_STATUS } = require("../utils/constants.js");
const { validationErrorResponseData } = require("../utils/response.js");
const { validationMessageKey } = require("../utils/helper.js");

const createProjectValidation = (req, res, callback) => {
  const schema = joi.object({
    title: joi.string().trim().required(),
    description: joi.string().optional().trim().allow(""),
    startDate: joi.date().iso().required(),
    endDate: joi.date().iso().min(joi.ref("startDate")).required(),
    status: joi
      .string()
      .required()
      .valid(...Object.values(PROJECT_STATUS)),
  });

  const { error, value } = schema.validate(req, {
    abortEarly: false,
    convert: true, // ensures trim(), date parsing, etc. are applied
    stripUnknown: false, // remove any unexpected fields if true
  });

  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("createProjectValidation", error))
    );
  }
  Object.assign(req, value);
  return callback(true);
};

const updateProjectValidation = (req, res, callback) => {
  const schema = joi.object({
    projectId: joi.string().trim().required().length(36),
    title: joi.string().trim(),
    description: joi.string(),
    startDate: joi.date().iso(),
    endDate: joi.date().iso().min(joi.ref("startDate")),
    status: joi.string().valid(...Object.values(PROJECT_STATUS)),
  });

  const { error, value } = schema.validate(req, {
    abortEarly: false,
    convert: true, // ensures trim(), date parsing, etc. are applied
    stripUnknown: false, // remove any unexpected fields if true
  });

  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("updateProjectValidation", error))
    );
  }
  Object.assign(req, value);
  return callback(true);
};

const addProjectMembersValidation = (req, res, callback) => {
  const schema = joi.object({
    projectId: joi.string().trim().required().length(36),
    userIds: joi.array().items(joi.string()).unique().required().max(5),
  });

  const { error, value } = schema.validate(req, {
    abortEarly: false,
    convert: true, // ensures trim(), date parsing, etc. are applied
    stripUnknown: false, // remove any unexpected fields if true
  });

  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("addProjectMembersValidation", error))
    );
  }
  Object.assign(req, value);
  return callback(true);
};

const removeProjectMembersValidation = (req, res, callback) => {
  const schema = joi.object({
    projectId: joi.string().trim().required().length(36),
    userIds: joi.array().items(joi.string()).unique().required(),
  });

  const { error, value } = schema.validate(req, {
    abortEarly: false,
    convert: true, // ensures trim(), date parsing, etc. are applied
    stripUnknown: false, // remove any unexpected fields if true
  });

  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("removeProjectMembersValidation", error))
    );
  }
  Object.assign(req, value);
  return callback(true);
};

const getProjectValidation = (req, res, callback) => {
  const schema = joi.object({
    projectId: joi.string().trim().required().length(36),
  });

  const { error, value } = schema.validate(req, {
    abortEarly: false,
    convert: true, // ensures trim(), date parsing, etc. are applied
    stripUnknown: false, // remove any unexpected fields if true
  });

  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("getProjectValidation", error))
    );
  }
  Object.assign(req, value);
  return callback(true);
};

module.exports = {
  getProjectValidation,
  updateProjectValidation,
  createProjectValidation,
  addProjectMembersValidation,
  removeProjectMembersValidation,
};
