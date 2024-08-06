const asyncHandler = require("express-async-handler");
const userController = asyncHandler(async (req, res) => {
  res.render("index", { message: "User" });
});
module.exports = userController;
