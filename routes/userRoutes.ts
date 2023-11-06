import express from "express";
import userController from "../controllers/userController";
import { check } from "express-validator";

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/login",
  [
    check("email", "Please enter valid email").isEmail(),
    check("password", "Please enter password").not().isEmpty(),
  ],
  userController.login
);

router.post(
  "/signup",
  [
    check("firstName", "Please enter you first name").not().isEmpty(),
    check("lastName", "Please enter you last name").not().isEmpty(),
    check("email", "Please enter valid email").isEmail(),
    check("password", "Please enter password").not().isEmpty(),
  ],
  userController.addNewUser
);

router.post(
  "/update",
  [
    check("firstName", "Please enter you first name").not().isEmpty(),
    check("lastName", "Please enter you last name").not().isEmpty(),
    check("email", "Please enter valid email").isEmail(),
    check("password", "Please enter password").not().isEmpty(),
  ],
  userController.updateUser
);

router.delete("/delete/:email", [], userController.deleteUser);

router.post("/verifyToken", authMiddleware, userController.verifyToken);

module.exports = router;
