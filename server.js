const express = require("express");
const { createServer } = require("http");
const dbConnection = require("./config/database.js");
const { config } = require("dotenv");

config();
dbConnection;

const app = express();
app.use(express.json());

const server = createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});
