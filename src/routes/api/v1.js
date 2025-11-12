const { Router } = require("express");
const {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
} = require("../../controllers/authController.js");
const { userAuthToken } = require("../../middlewares/authUser.js");
const { createProject } = require("../../controllers/projectController.js");
const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);

router.use("/", userAuthToken);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/project", createProject);

module.exports = router;
