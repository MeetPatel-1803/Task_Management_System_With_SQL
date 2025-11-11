const joi = require("joi");
const { validationErrorResponseData } = require("../utils/response.js");
const { validationMessageKey } = require("../utils/helper.js");

const signUpValidation = (req, res, callback) => {
  const schema = joi.object({
    name: joi.string().trim(true).required(),
    email: joi
      .string()
      .email()
      .trim(true)
      .pattern(/^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
      .required(), // EMAIL DOMAIN VALIDATION,
    password: joi
      .string()
      .required()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      ),
    phone_number: joi.string().optional(),
  });
  const { error } = schema.validate(req);
  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("signUpValidation", error))
    );
  }
  return callback(true);
};

const signInValidation = (req, res, callback) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });
  const { error } = schema.validate(req);
  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("signInValidation", error))
    );
  }
  return callback(true);
};

const forgotPasswordValidation = (req, res, callback) => {
  const schema = joi.object({
    email: joi.string().email().required(),
  });
  const { error } = schema.validate(req);
  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("forgotPasswordValidation", error))
    );
  }
  return callback(true);
};

const resetPasswordValidation = (req, res, callback) => {
  const schema = joi.object({
    token: joi.string().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().required().valid(joi.ref("password")),
  });
  const { error } = schema.validate(req);
  if (error) {
    return validationErrorResponseData(
      res,
      res.__(validationMessageKey("forgotPasswordValidation", error))
    );
  }
  return callback(true);
};

module.exports = {
  signUpValidation,
  signInValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
