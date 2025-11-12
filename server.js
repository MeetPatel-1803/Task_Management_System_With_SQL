const express = require("express");
const { createServer } = require("http");
const i18n = require("./src/i18n/i18n.cjs");
const dbConnection = require("./config/database.js");
const { config } = require("dotenv");
const apiRoutes = require("./src/routes/index.js");

config();
dbConnection;

const app = express();
app.use(express.json());
app.use(i18n);
app.use("/", apiRoutes);

const server = createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});
