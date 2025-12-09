const { Sequelize, Model } = require("sequelize");
const { Task, User, sequelize, UserTask } = require("../models/index.js");
const { USER_ROLES, META_CODE } = require("../utils/constants.js");
const {
  internalServerErrorResponse,
  errorResponseWithoutData,
  successResponseData,
  successResponseWithoutData,
} = require("../utils/response.js");
const {
  createTaskValidation,
  updateTaskValidation,
  addRemoveTaskMembersValidation,
} = require("../validations/taskValidations.js");
const { getData } = require("../utils/dbHelper.js");

const createTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const reqParams = req.body;
    const projectId = req.params.id;
    createTaskValidation(reqParams, res, async (validate) => {
      if (validate) {
        try {
          const task = await Task.create(
            {
              title: reqParams.title,
              description: reqParams.description || null,
              start_date: reqParams.startDate,
              due_date: reqParams.dueDate,
              status: reqParams.status,
              priority: reqParams.priority,
              project_id: projectId,
              created_by: req.authUser.id,
            },
            { transaction }
          );

          const taskDetail = await Task.findByPk(task.id, {
            include: {
              model: User,
              attributes: [],
            },
            attributes: {
              include: [
                [Sequelize.col("user.name"), "created_by"],
                [Sequelize.col("user.profile_picture"), "profile_picture"],
                [Sequelize.col("user.id"), "user_id"],
              ],
            },
            raw: true,
            transaction,
          });

          const { created_by, profile_picture, user_id, ...remaining } =
            taskDetail;
          const responseObj = {
            ...remaining,
            createdBy: {
              name: created_by,
              profilePicture: profile_picture,
              userId: user_id,
            },
          };

          if (responseObj) {
            await transaction.commit();
            return successResponseData(
              res,
              responseObj,
              META_CODE.SUCCESS,
              res.__("taskCreatedSuccessfully")
            );
          } else {
            await transaction.rollback();
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__("taskCreationFailed")
            );
          }
        } catch (error) {
          await transaction.rollback();
          if (error instanceof Sequelize.UniqueConstraintError) {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__("taskAlreadyExist")
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
    await transaction.rollback();
    return internalServerErrorResponse(res);
  }
};

const updateTask = async (req, res) => {
  try {
    const reqParams = req.body;
    const taskId = req.params.taskId;
    updateTaskValidation(reqParams, res, async (validate) => {
      if (validate) {
        try {
          const taskDetails = await Task.findByPk(taskId);
          if (taskDetails) {
            const [rows, updatedTasks] = await Task.update(
              {
                title: reqParams.title,
                description: reqParams.description || null,
                start_date: reqParams.startDate,
                due_date: reqParams.dueDate,
                status: reqParams.status,
                priority: reqParams.priority,
              },
              {
                where: {
                  id: taskId,
                },
                returning: true,
              }
            );

            if (updatedTasks.length) {
              return successResponseData(
                res,
                updatedTasks[0],
                META_CODE.SUCCESS,
                res.__("taskUpdatedSuccessfully")
              );
            }
          } else {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__("taskNotFound")
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

const deleteTask = async (req, res) => {
  try {
    if (req.authUser.role !== USER_ROLES.PM) {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("accessDenied")
      );
    }
    const taskId = req.params.taskId;
    if (!taskId) {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("taskIdRequired")
      );
    }
    const taskDetails = await Task.findByPk(taskId);
    if (taskDetails) {
      const deleteTask = await Task.destroy({
        where: {
          id: taskId,
        },
      });
      if (deleteTask) {
        return successResponseWithoutData(
          res,
          META_CODE.SUCCESS,
          res.__("taskDeletedSuccessfully")
        );
      }
    } else {
      return errorResponseWithoutData(
        res,
        META_CODE.FAIL,
        res.__("taskNotFound")
      );
    }
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const getTasks = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const query = `
SELECT 
          tasks.title, 
          tasks.description, 
          tasks.start_date, 
          tasks.due_date, 
          tasks.status, 
          tasks.priority, 
          (
      SELECT 
          json_build_object(
      'name',
      users.name,
      'profile_picture',
      users.profile_picture,
      'userId',
      users.id
      ) 
        FROM users 
        WHERE users.id = tasks.created_by
      ) AS created_by, 
          json_agg(
      json_build_object(
      'name',
      users.name,
      'profile_picture',
      users.profile_picture,
      'userId',
      users.id
      )
      ) AS assignee 
        FROM tasks 
        LEFT JOIN user_tasks ON user_tasks.task_id = tasks.id 
        LEFT JOIN users ON user_tasks.user_id = users.id 
        WHERE tasks.id = :taskId 
        GROUP BY tasks.id
    `;

    const replacements = { taskId };
    const tasks = await getData(query, replacements);
    return successResponseData(
      res,
      tasks[0],
      META_CODE.SUCCESS,
      res.__("taskFetched")
    );
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const projectTasks = async (req, res) => {
  try {
    const reqParams = req.query;
    const projectId = req.params.id;
    const baseQuery = `
SELECT 
          tasks.id, 
          tasks.title, 
          tasks.status, 
          tasks.priority, 
          json_agg(
              json_build_object(
              'name',
              users.name,
              'profile_picture',
              users.profile_picture,
              'userId',
              users.id
              )
              ) AS users 
        FROM tasks 
        LEFT JOIN user_tasks ON user_tasks.task_id = tasks.id 
        LEFT JOIN users ON user_tasks.user_id = users.id 
        WHERE tasks.project_id = :projectId
      `;
    const filteredQuery = `${baseQuery}
            AND (:assignee IS NULL OR user_tasks.user_id = :assignee)
            AND (:status IS NULL OR tasks.status = :status)
            AND (:priority IS NULL OR tasks.priority = :priority) 
        GROUP BY tasks.id
      `;
    const normalQuery = `${baseQuery} GROUP BY tasks.id`;

    const replacements = {
      projectId,
      assignee: reqParams.assignee || null,
      status: reqParams.status || null,
      priority: reqParams.priority || null,
    };

    const hasAnyFilter =
      reqParams.assignee || reqParams.status || reqParams.priority;
    const filteredQueryData = hasAnyFilter
      ? await getData(filteredQuery, replacements)
      : [];

    const normalQueryData = filteredQueryData.length
      ? []
      : await getData(normalQuery, replacements);

    return successResponseData(
      res,
      { filteredQueryData, normalQueryData },
      META_CODE.SUCCESS,
      res.__("projectTasksList")
    );
  } catch (error) {
    return internalServerErrorResponse(res);
  }
};

const addRemoveTaskMembers = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const reqParams = req.body;
    const taskId = req.params.taskId;
    const projectId = req.params.id;

    addRemoveTaskMembersValidation(reqParams, res, async (validate) => {
      if (validate) {
        if (!taskId) {
          return errorResponseWithoutData(
            res,
            META_CODE.FAIL,
            res.__("taskIdRequired")
          );
        }

        let query = `
SELECT 
          user_tasks.user_id 
        FROM user_tasks 
        WHERE user_tasks.task_id = :taskId
    `;

        let replacements = { taskId };
        const assignedUsers = await getData(query, replacements, transaction);

        let assignedUsersIds = assignedUsers.map((user) => user.user_id);
        let userAlreadyAssigned;

        if (assignedUsersIds.length) {
          userAlreadyAssigned = assignedUsersIds.includes(reqParams.userId);
        }
        if (reqParams.shouldAddUsers) {
          if (userAlreadyAssigned) {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__("userAlreadyAssigned")
            );
          }

          await UserTask.create(
            {
              user_id: reqParams.userId,
              task_id: taskId,
            },
            { transaction }
          );
        } else {
          if (!userAlreadyAssigned || !assignedUsersIds.length) {
            return errorResponseWithoutData(
              res,
              META_CODE.FAIL,
              res.__("noDataFound")
            );
          }

          await UserTask.destroy(
            {
              where: {
                user_id: reqParams.userId,
                task_id: taskId,
              },
            },
            { transaction }
          );
        }

        query = `
SELECT 
          user_tasks.user_id, 
          users.name, 
          users.profile_picture 
        FROM user_tasks 
        INNER JOIN users ON users.id = user_tasks.user_id 
        WHERE user_tasks.task_id = :taskId
      `;
        replacements = { taskId };
        const userTaskData = await getData(query, replacements, transaction);

        assignedUsersIds = userTaskData.map((user) => user.user_id);

        query = `
SELECT 
          user_projects.user_id, 
          users.name, 
          users.profile_picture 
        FROM user_projects 
        INNER JOIN users ON users.id = user_projects.user_id 
        WHERE user_projects.project_id = :projectId
      `;

        replacements = { projectId };
        const projectMembers = await getData(query, replacements, transaction);

        const UnAssignedUsers = projectMembers.filter(
          (member) => !assignedUsersIds.includes(member.user_id)
        );

        if (reqParams.shouldAddUsers) {
          await transaction.commit();
          return successResponseData(
            res,
            { assignedUsers: userTaskData, UnAssignedUsers },
            META_CODE.SUCCESS,
            res.__("taskMembersAddedSuccessfully")
          );
        } else {
          await transaction.commit();
          return successResponseData(
            res,
            { assignedUsers: userTaskData, UnAssignedUsers },
            META_CODE.SUCCESS,
            res.__("taskMembersRemovedSuccessfully")
          );
        }
      }
    });
  } catch (error) {
    await transaction.rollback();
    return internalServerErrorResponse(res);
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  projectTasks,
  addRemoveTaskMembers,
};
