const { Router } = require("express");
const bcrypt = require("bcryptjs");

const userController = require("../controllers/userController");

const userRouter = Router();

const prisma = require("../db");
const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});
userRouter.get("/", userController.userController);
userRouter.get("/login", userController.loginController);
userRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/:id/storage",
    failureRedirect: "/login",
    failureMessage: true,
  })
);
userRouter.get("/register", userController.registerControllerGET);
userRouter.post("/register", userController.registerControllerPOST);
userRouter.get("/logout", userController.logoutController);

userRouter.get("/:id/storage", userController.storageController);

module.exports = userRouter;
