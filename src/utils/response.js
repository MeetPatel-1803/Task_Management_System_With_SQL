/**
 * @description This function use for format success response of rest api containing data
 * @param data
 * @param code
 * @param message
 * @param res
 * @param extras
 * @returns {{data: *, meta: {message: *, code: *}}}
 */
const successResponseData = (res, data, code = 1, message, extras) => {
  const response = {
    data,
    meta: {
      code,
      message,
    },
  };
  if (extras) {
    Object.keys(extras).forEach((key) => {
      if ({}.hasOwnProperty.call(extras, key)) {
        response.meta[key] = extras[key];
      }
    });
  }
  return res.send(response);
};

/**
 * @description This function use for format success response of rest api witout data
 * @param res
 * @param message
 * @param code
 * @returns {{data: *, meta: {message: *, code: *}}}
 */
const successResponseWithoutData = (res, code = 1, message, extras) => {
  const response = {
    data: null,
    meta: {
      code,
      message,
    },
  };
  if (extras) {
    Object.keys(extras).forEach((key) => {
      if ({}.hasOwnProperty.call(extras, key)) {
        response.meta[key] = extras[key];
      }
    });
  }
  return res.send(response);
};

/**
 * @description This function use for format error response of rest api
 * @param res
 * @param message
 * @param code
 * @returns {{response: {code: *, message: *}}}
 */
const errorResponseData = (res, data, code = 400, message) => {
  const response = {
    data,
    meta: {
      code,
      message,
    },
  };
  if (code > 200) {
    return res.status(code).send(response);
  } else {
    return res.send(response);
  }
};

/**
 * @description This function use for format error response of rest api witout data
 * @param res
 * @param message
 * @param code
 * @returns {{data: *, meta: {code: *, message: *}}}
 */
const errorResponseWithoutData = (res, code = 0, message, metaCode = null) => {
  const response = {
    data: null,
    meta: {
      code: metaCode || code,
      message,
    },
  };
  if (code > 200) {
    return res.status(code).send(response);
  } else {
    return res.send(response);
  }
};

/**
 * @description This function use for format validation error response of rest api
 * @param res
 * @param message
 * @param code
 * @returns {{response: {code: *, message: *}}}
 */
const validationErrorResponseData = (res, message, code = 400) => {
  const response = {
    code,
    message,
  };
  return res.status(code).send(response);
};

/**
 * @description This function use for server error response of rest api
 * @param res
 * @param message
 * @param code
 * @returns {{response: {code: *, message: *}}}
 */
const internalServerErrorResponse = (res) => {
  const response = {
    code: 500,
    message: res.__("internalError"),
  };
  return res.status(500).send(response);
};

module.exports = {
  successResponseData,
  successResponseWithoutData,
  errorResponseData,
  errorResponseWithoutData,
  validationErrorResponseData,
  internalServerErrorResponse,
};
