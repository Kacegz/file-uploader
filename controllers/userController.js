const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const prisma = require("../db");
const userController = asyncHandler(async (req, res) => {
  res.render("index", { user: req.user });
});
const loginController = asyncHandler(async (req, res) => {
  res.render("login");
});
const registerControllerGET = asyncHandler(async (req, res) => {
  res.render("register");
});
const registerControllerPOST = asyncHandler(async (req, res) => {
  try {
    const exists = await prisma.user.findUnique({
      where: { username: req.body.username },
    });
    if (exists) {
      return res.render("register", { error: "User already exists", user: "" });
    }
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      await prisma.user.create({
        data: {
          username: req.body.username,
          password: hashedPassword,
        },
      });
      if (err) {
        return res.render("register", { error: err });
      }
      return res.render("index", { user: req.user });
    });
  } catch (err) {
    return next(err);
  }
});
const logoutController = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
module.exports = {
  userController,
  loginController,
  registerControllerGET,
  registerControllerPOST,
  logoutController,
};
