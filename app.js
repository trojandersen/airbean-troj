const express = require("express");
const session = require("express-session");
const { connectToMongoDB } = require("./config/database");
const cors = require("cors");
const routes = require("./routes/routes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: "grupp7",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use("/", routes);

connectToMongoDB();

module.exports = app;
