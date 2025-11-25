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
// const { userAccess } = require("../../middlewares/userAccess.js");
const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);

router.use("/", userAuthToken);
// router.use("/", userAccess);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/project/:id", getProject);
router.post("/project", createProject);
router.put("/project/:id", updateProject);
router.delete("/project/:id", deleteProject);

router.post("/project/add-members", addProjectMembers);
router.post("/project/remove-members", removeProjectMembers);

router.get("/:id/projects", listUserProjects);
router.get("/:id/profile", userProfile);

module.exports = router;
