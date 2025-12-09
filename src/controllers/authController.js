const { User, UserPasswordResets } = require("../models/index.js");
const { META_CODE, RESPONSE_CODE } = require("../utils/constants.js");
const {
  internalServerErrorResponse,
  errorResponseWithoutData,
  successResponseData,
  errorResponseData,
  successResponseWithoutData,
} = require("../utils/response.js");
const {
  signUpValidation,
  signInValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../validations/authValidations.js");
const { issueUserToken } = require("../services/jwtServices.js");
const bcrypt = require("bcrypt");
const { randomTokens } = require("../utils/helper.js");
const nodemailer = require("nodemailer");
const { resetPasswordTemplate } = require("../services/emailService.js");
require("dotenv").config();

const signUp = async (req, res) => {
  try {
    const reqParams = req.body;
    signUpValidation(reqParams, res, async (validate) => {
      if (validate) {
        const user = await User.findOne({
          where: {
            email: reqParams.email,
          },
        });

        if (user) {
          return errorResponseWithoutData(
            res,
            META_CODE.FAIL,
            res.__("userAlreadyExist")
          );
        } else {
          bcrypt.hash(reqParams.password, 10, async (err, hash) => {
            if (err) {
              return internalServerErrorResponse(res);
            }
            const newUser = await User.create({
              name: reqParams.name,
              email: reqParams.email,
              password: hash,
              phone_number: reqParams.phone_number,
              role: reqParams.role,
            });
            if (newUser) {
              return successResponseData(
                res,
                newUser,
                META_CODE.SUCCESS,
                res.__("userCreatedSuccessfully")
              );
            } else {
              return internalServerErrorResponse(res);
            }
          });
        }
      }
    });
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const signIn = async (req, res) => {
  try {
    const reqParams = req.body;
    signInValidation(reqParams, res, async (validate) => {
      if (validate) {
        const user = await User.findOne({
          where: {
            email: reqParams.email,
          },
        });
        if (user) {
          bcrypt.compare(
            reqParams.password,
            user.password,
            async (err, result) => {
              if (err) {
                return internalServerErrorResponse(res);
              }
              if (result) {
                const payload = {
                  id: user.id,
                  email: user.email,
                };
                const token = await issueUserToken(payload);

                return successResponseData(
                  res,
                  { token },
                  META_CODE.SUCCESS,
                  res.__("loginSuccess")
                );
              } else {
                return errorResponseWithoutData(
                  res,
                  META_CODE.FAIL,
                  res.__("invalidCredentials")
                );
              }
            }
          );
        } else {
          return errorResponseWithoutData(
            res,
            META_CODE.FAIL,
            res.__("userNotFound")
          );
        }
      }
    });
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const reqParams = req.body;
    forgotPasswordValidation(reqParams, res, async (validate) => {
      if (validate) {
        const user = await User.findOne({
          where: {
            email: reqParams.email,
          },
        });

        if (user) {
          const token = randomTokens(2);
          const d = new Date();
          const tokenExpire = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            d.getHours(),
            d.getMinutes() + 1,
            d.getSeconds(),
            d.getMilliseconds()
          );

          const passwordResetToken = await UserPasswordResets.findOne({
            where: { user_id: user.id },
          });

          let resetPasswordUrl;
          if (passwordResetToken && !passwordResetToken.token) {
            await UserPasswordResets.create({
              user_id: user.id,
              token,
              expires_at: tokenExpire,
            });

            resetPasswordUrl = `${process.env.FRONTEND_URL}/api/v1/reset-password?tokenId=${token}`;

            const transporter = nodemailer.createTransport({
              service: process.env.EMAIL_SERVICE,
              host: process.env.HOST_SERVICE,
              port: process.env.SERVICE_PORT,
              secure: true,
              auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
              },
            });

            try {
              await transporter.sendMail({
                from: process.env.MAIL_USER,
                to: reqParams.email,
                subject: process.env.EMAIL_SUBJECT,
                html: resetPasswordTemplate({
                  name: user.name,
                  resetPasswordUrl,
                }),
              });
            } catch (error) {
              return errorResponseWithoutData(
                res,
                META_CODE.FAIL,
                res.__(error.message)
              );
            }
          }

          return successResponseData(
            res,
            { resetPasswordUrl, token },
            META_CODE.SUCCESS,
            res.__("emailSent")
          );
        } else {
          return errorResponseData(
            res,
            META_CODE.FAIL,
            res.__("emailNotRegistered")
          );
        }
      }
    });
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const resetPassword = async (req, res) => {
  try {
    let reqParams = req.body;
    const token = req.query.tokenId;
    reqParams = {
      ...reqParams,
      token,
    };
    resetPasswordValidation(reqParams, res, async (validate) => {
      if (validate) {
        const resetToken = await UserPasswordResets.findOne({
          where: {
            token: reqParams.token,
          },
        });

        if (resetToken && resetToken.expires_at < new Date()) {
          return errorResponseWithoutData(
            res,
            RESPONSE_CODE.UNAUTHORIZED,
            res.__("tokenExpired")
          );
        } else {
          if (resetToken) {
            bcrypt.hash(reqParams.password, 10, async (err, hash) => {
              if (err) {
                return errorResponseWithoutData(
                  res,
                  META_CODE.FAIL,
                  res.__(err)
                );
              } else {
                const setData = await UserPasswordResets.update(
                  { token: null, expires_at: null },
                  { where: { user_id: req.authUser.id } }
                );
                const updatePassword = await User.update(
                  { password: hash },
                  { where: { id: req.authUser.id } }
                );
                if (!setData || !updatePassword) {
                  return errorResponseWithoutData(
                    res,
                    RESPONSE_CODE.TOKEN_INVALID,
                    res.__("invalidToken")
                  );
                } else {
                  return successResponseWithoutData(
                    res,
                    META_CODE.SUCCESS,
                    res.__("passwordResetSuccess")
                  );
                }
              }
            });
          } else {
            return errorResponseWithoutData(
              res,
              RESPONSE_CODE.TOKEN_INVALID,
              res.__("invalidToken")
            );
          }
        }
      }
    });
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

module.exports = {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
};
