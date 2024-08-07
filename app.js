const express = require("express");
const path = require("node:path");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");

const userRouter = require("./routes/router");

const app = express();
const prisma = require("./db");

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.session());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", userRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
