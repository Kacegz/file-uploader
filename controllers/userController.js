const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const prisma = require("../db");
const testFolder = "./uploads/";
const fs = require("fs");

const userController = asyncHandler(async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("storage");
  }
  res.render("index");
});
const loginController = asyncHandler(async (req, res) => {
  res.render("login");
});
const loginControllerPOST = asyncHandler(async (req, res) => {
  res.render(`storage`, { user: req.user });
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
          categories: {
            create: {
              name: "Photos",
            },
          },
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
const storageController = asyncHandler(async (req, res) => {
  if (req.isAuthenticated()) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { categories: true },
    });
    const files = [...fs.readdirSync(testFolder)];
    console.log(files);
    return res.render("storage", {
      user: req.user,
      files,
      categories: user.categories.map((category) => category.name),
    });
  }
  return res.redirect("login");
});
const newFileController = asyncHandler(async (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.file, req.body);
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { categories: true },
    });
    return res.render("storage", {
      user: req.user,
      files: [req.file],
      categories: user.categories.map((category) => category.name),
    });
  }
  return res.redirect("login");
});
const newCategoryController = asyncHandler(async (req, res) => {
  if (req.isAuthenticated()) {
    await prisma.category.create({
      data: {
        name: req.body.name,
        userId: req.user.id,
      },
    });
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { categories: true },
    });
    return res.redirect("../storage");
  }
  return res.render("login");
});
const removeCategoryController = asyncHandler(async (req, res) => {
  if (req.isAuthenticated()) {
    const catId = await prisma.category.findFirst({
      where: { name: req.params.id },
    });
    await prisma.category.delete({
      where: {
        id: catId.id,
      },
    });
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { categories: true },
    });
    return res.redirect("../storage");
  }
  return res.render("login");
});
module.exports = {
  userController,
  loginController,
  registerControllerGET,
  registerControllerPOST,
  logoutController,
  storageController,
  loginControllerPOST,
  newFileController,
  newCategoryController,
  removeCategoryController,
};
