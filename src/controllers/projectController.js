const { Sequelize, Op } = require("sequelize");
const { Project, User } = require("../models/index.js");
const { META_CODE, USER_ROLES } = require("../utils/constants.js");
const {
  internalServerErrorResponse,
  errorResponseWithoutData,
  successResponseData,
  successResponseWithoutData,
} = require("../utils/response");
const {
  createProjectValidation,
  updateProjectValidation,
  addProjectMembersValidation,
  removeProjectMembersValidation,
  getProjectValidation,
} = require("../validations/projectValidations");
const { getData } = require("../utils/dbHelper.js");
const { valid } = require("joi");

const createProject = async (req, res) => {
  try {
    // WE CAN INCLUDE PROJECT SPENT_TIME, TYPE(INHOUSE,CLIENT etc).
    if (req.authUser.role !== USER_ROLES.PM) {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("accessDenied")
      );
    }
    const reqParams = req.body;
    createProjectValidation(reqParams, res, async (validate) => {
      if (validate) {
        try {
          const newProject = await Project.create({
            title: reqParams.title,
            start_date: reqParams.startDate,
            end_date: reqParams.endDate,
            status: reqParams.status,
            description: reqParams.description || null,
            created_by: req.authUser.id,
          });

          const projectDetails = await Project.findByPk(newProject.id, {
            include: [
              {
                model: User,
                attributes: [],
              },
            ],
            attributes: {
              include: [[Sequelize.col("name"), "created_by"]],
            },
          });

          return successResponseData(
            res,
            projectDetails,
            META_CODE.SUCCESS,
            res.__("projectCreatedSuccessfully")
          );
        } catch (error) {
          if (error instanceof Sequelize.UniqueConstraintError) {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__("projectNameAlreadyExist")
            );
          } else {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__(error.message)
            );
          }
        }
      }
    });
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const updateProject = async (req, res) => {
  try {
    if (req.authUser.role !== USER_ROLES.PM) {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("accessDenied")
      );
    }
    let reqParams = req.body;
    const projectId = req.params.projectId;
    reqParams = {
      ...reqParams,
      projectId,
    };

    updateProjectValidation(reqParams, res, async (validate) => {
      if (validate) {
        try {
          const projectDetails = await Project.findByPk(projectId);
          if (projectDetails) {
            const updateProject = await Project.update(
              {
                title: reqParams.title,
                start_date: reqParams.startDate,
                end_date: reqParams.endDate,
                status: reqParams.status,
                description: reqParams.description || null,
              },
              {
                where: {
                  id: projectId,
                },
              }
            );

            if (updateProject) {
              return successResponseData(
                res,
                updateProject,
                META_CODE.SUCCESS,
                res.__("projectUpdatedSuccessfully")
              );
            } else {
              return errorResponseWithoutData(
                res,
                META_CODE.FAIL,
                res.__("projectNotFound")
              );
            }
          } else {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__("projectNotFound")
            );
          }
        } catch (error) {
          return errorResponseWithoutData(
            res,
            META_CODE.FAIL,
            res.__(error.message)
          );
        }
      }
    });
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const deleteProject = async (req, res) => {
  try {
    if (req.authUser.role !== USER_ROLES.PM) {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("accessDenied")
      );
    }
    const projectId = req.params.projectId;
    if (!projectId) {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("projectIdRequired")
      );
    }
    const projectDetails = await Project.findByPk(projectId);
    if (projectDetails) {
      const deleteProject = await Project.destroy({
        where: {
          id: projectId,
        },
      });
      if (deleteProject) {
        return successResponseWithoutData(
          res,
          META_CODE.SUCCESS,
          res.__("projectDeletedSuccessfully")
        );
      } else {
        return errorResponseWithoutData(
          res,
          META_CODE.FAIL,
          res.__("projectNotFound")
        );
      }
    } else {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("projectNotFound")
      );
    }
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const getProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    getProjectValidation({ projectId }, res, async (validate) => {
      if (validate) {
        try {
          // Sequelize query for the same.
          const query = `
SELECT 
          projects.*, 
          users.name AS created_by 
        FROM projects 
        INNER JOIN users ON projects.created_by = users.id 
        WHERE projects.id = :projectId
    `;
          const replacements = { projectId };
          const projectDetails = await getData(query, replacements);

          if (projectDetails && projectDetails.length) {
            return successResponseData(
              res,
              projectDetails[0],
              META_CODE.SUCCESS,
              res.__("projectDetails")
            );
          } else {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__("projectNotFound")
            );
          }
        } catch (error) {
          return errorResponseWithoutData(
            res,
            META_CODE.FAIL,
            res.__(error.message)
          );
        }
      }
    });
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const addProjectMembers = async (req, res) => {
  try {
    if (req.authUser.role !== USER_ROLES.PM) {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("accessDenied")
      );
    }

    const reqParams = req.body;
    addProjectMembersValidation(reqParams, res, async (validate) => {
      if (validate) {
        try {
          const projectDetails = await Project.findByPk(reqParams.projectId, {
            include: [
              {
                model: User,
                attributes: [],
              },
            ],
            attributes: {
              include: [
                [Sequelize.col("user.name"), "created_by"],
                [Sequelize.col("user.profile_picture"), "profile_picture"],
              ],
            },
          });

          if (projectDetails) {
            const projectMembers = await projectDetails.getUsers({
              raw: true,
              joinTableAttributes: [],
            });

            let unAssignedUsers;
            if (projectMembers.length) {
              unAssignedUsers = reqParams.userIds?.filter(
                (id) => !projectMembers?.some((member) => member.id === id)
              );
            } else {
              unAssignedUsers = reqParams.userIds;
            }

            await projectDetails.addUsers(unAssignedUsers);

            const assignedUsers = await projectDetails.getUsers({
              raw: true,
              joinTableAttributes: [],
            });
            const projectData = await projectDetails.get({
              plain: true,
              attributes: {
                include: [[Sequelize.col("name"), "created_by"]],
              },
            });

            const projectMembersData = assignedUsers.map((user) => {
              return {
                userName: user.name,
                profilePicture: user.profile_picture || null,
                role: user.role,
                projectTile: projectData.title,
                description: projectData.description || null,
                projectId: projectData.id,
                startDate: projectData.start_date,
                endDate: projectData.end_date,
                status: projectData.status,
                createdBy: {
                  name: projectData.created_by,
                  profilePicture: projectData.profile_picture || null,
                },
              };
            });

            if (assignedUsers) {
              return successResponseData(
                res,
                projectMembersData,
                META_CODE.SUCCESS,
                res.__("projectAssignedSuccessfully")
              );
            }
          } else {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__("projectNotFound")
            );
          }
        } catch (error) {
          return errorResponseWithoutData(
            res,
            META_CODE.FAIL,
            res.__(error.message)
          );
        }
      }
    });
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const removeProjectMembers = async (req, res) => {
  try {
    if (req.authUser.role !== USER_ROLES.PM) {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("accessDenied")
      );
    }
    const reqParams = req.body;
    removeProjectMembersValidation(reqParams, res, async (validate) => {
      if (validate) {
        try {
          const projectDetails = await Project.findByPk(reqParams.projectId);
          if (projectDetails) {
            const projectMembers = await projectDetails.getUsers({
              raw: true,
              joinTableAttributes: [],
            });

            if (projectMembers.length) {
              const removeMember = await projectDetails.removeUsers(
                reqParams.userIds
              );

              if (removeMember) {
                return successResponseWithoutData(
                  res,
                  META_CODE.SUCCESS,
                  res.__("projectMemberRemovedSuccessfully")
                );
              }
            } else {
              return errorResponseWithoutData(
                res,
                META_CODE.FAIL,
                res.__("noValidUsersToRemove")
              );
            }
          } else {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__("noProjectMembersFound")
            );
          }
        } catch (error) {
          if (error.message.includes("invalid input syntax for type uuid")) {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__("invalidUserId")
            );
          } else {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__(error.message)
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
  createProject,
  updateProject,
  deleteProject,
  getProject,
  addProjectMembers,
  removeProjectMembers,
};
