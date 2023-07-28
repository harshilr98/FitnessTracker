require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const { client } = require("./db");
const morgan = require("morgan");

// Setup your Middleware and API Router here
app.use(cors());
client.connect();

app.use(morgan("dev"));
app.use(express.json());

const apiRouter = require("./api");
app.use("/api", apiRouter);

app.use((req, res, next) => {
  res.status(404).send('404: Page not found');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('500: Internal Server Error');
});

module.exports = app;