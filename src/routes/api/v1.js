const { Router } = require("express");
const {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
} = require("../../controllers/authController.js");
const { userAuthToken } = require("../../middlewares/authUser.js");
const {
  createProject,
  updateProject,
  deleteProject,
  addProjectMembers,
  removeProjectMembers,
  getProject,
} = require("../../controllers/projectController.js");
const {
  listUserProjects,
  userProfile,
} = require("../../controllers/userController.js");
const {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  addRemoveTaskMembers,
  projectTasks,
} = require("../../controllers/taskController.js");
const validateProject = require("../../middlewares/validateProject.js");
// const { userAccess } = require("../../middlewares/userAccess.js");
const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);

router.use("/", userAuthToken);
// router.use("/", userAccess);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/project/:id", validateProject, getProject);
router.post("/project", createProject);
router.put("/project/:id", validateProject, updateProject);
router.delete("/project/:id", validateProject, deleteProject);

router.post("/project/add-members", addProjectMembers);
router.post("/project/remove-members", removeProjectMembers);

router.get("/:id/projects", listUserProjects);
router.get("/:id/profile", userProfile);

router.post("/project/:id/task", validateProject, createTask);
router.put("/project/:id/task/:taskId", validateProject, updateTask);
router.delete("/project/:id/task/:taskId", validateProject, deleteTask);
router.get("/project/:id/task/board", validateProject, projectTasks);
router.get("/project/:id/task/:taskId", validateProject, getTasks);

router.post(
  "/project/:id/task/:taskId/add-remove-members",
  validateProject,
  addRemoveTaskMembers
);

module.exports = router;
