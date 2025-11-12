const { Router } = require("express");
const api = require("./api/index.js");

const router = Router();
router.use("/api", api);

module.exports = router;
