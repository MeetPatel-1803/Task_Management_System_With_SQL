const joi = require("joi");
const { PROJECT_STATUS } = require("../utils/constants.js");
const { validationErrorResponseData } = require("../utils/response.js");
const { validationMessageKey } = require("../utils/helper.js");

const createProjectValidation = (req, res, callback) => {
  const schema = joi.object({
    title: joi.string().required().trim(),
    description: joi.string().optional().allow(""),
    startDate: joi.date().required(),
    endDate: joi.date().required(), // Need to change
    status: joi
      .string()
      .required()
      .valid(...Object.values(PROJECT_STATUS)),
  });
  const { error } = schema.validate(req);
  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("createProjectValidation", error))
    );
  }
  return callback(true);
};

module.exports = {
  createProjectValidation,
};
