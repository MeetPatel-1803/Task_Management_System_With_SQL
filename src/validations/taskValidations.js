const joi = require("joi");
const { TASK } = require("../utils/constants.js");
const { validationErrorResponseData } = require("../utils/response.js");
const { validationMessageKey } = require("../utils/helper.js");

const createTaskValidation = (req, res, callback) => {
  const schema = joi.object({
    title: joi.string().trim().required(),
    description: joi.string().optional().trim().allow(""),
    startDate: joi.date().iso().required(),
    dueDate: joi.date().iso().min(joi.ref("startDate")).required(),
    status: joi
      .string()
      .required()
      .valid(...Object.values(TASK.STATUS)),
    priority: joi
      .string()
      .required()
      .valid(...Object.values(TASK.PRIORITY)),
    assignee: joi.array().items(joi.string()).unique().max(50),
    assignToMe: joi.boolean().required(),
  });

  const { error, value } = schema.validate(req, {
    abortEarly: false,
    convert: true, // ensures trim(), date parsing, etc. are applied
    stripUnknown: false, // remove any unexpected fields if true
  });

  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("createTaskValidation", error))
    );
  }
  Object.assign(req, value);
  return callback(true);
};

const updateTaskValidation = (req, res, callback) => {
  const schema = joi.object({
    title: joi.string().trim(),
    description: joi.string().optional().trim().allow(""),
    startDate: joi.date().iso(),
    dueDate: joi.date().iso().min(joi.ref("startDate")),
    status: joi.string().valid(...Object.values(TASK.STATUS)),
    priority: joi.string().valid(...Object.values(TASK.PRIORITY)),
  });

  const { error, value } = schema.validate(req, {
    abortEarly: false,
    convert: true, // ensures trim(), date parsing, etc. are applied
    stripUnknown: false, // remove any unexpected fields if true
  });

  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("createTaskValidation", error))
    );
  }
  Object.assign(req, value);
  return callback(true);
};

const addRemoveTaskMembersValidation = (req, res, callback) => {
  const schema = joi.object({
    userId: joi.string().required().uuid({ version: "uuidv4" }),
    shouldAddUsers: joi.boolean().required(),
  });

  const { error } = schema.validate(req);

  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("addRemoveTaskMembersValidation", error))
    );
  }
  return callback(true);
};

const projectTaskValidation = (req, res, callback) => {
  const schema = joi.object({
    assignee: joi.string().uuid({ version: "uuidv4" }),
    priority: joi.string().valid(...Object.values(TASK.PRIORITY)),
    status: joi.string().valid(...Object.values(TASK.STATUS)),
  });

  const { error } = schema.validate(req);

  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("projectTaskValidation", error))
    );
  }
  return callback(true);
};

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  addRemoveTaskMembersValidation,
  projectTaskValidation,
};
