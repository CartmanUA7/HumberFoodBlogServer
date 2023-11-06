"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controllers/userController"));
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
const authMiddleware = require("../middlewares/authMiddleware");
router.post("/login", [
    (0, express_validator_1.check)("email", "Please enter valid email").isEmail(),
    (0, express_validator_1.check)("password", "Please enter password").not().isEmpty(),
], userController_1.default.login);
router.post("/signup", [
    (0, express_validator_1.check)("firstName", "Please enter you first name").not().isEmpty(),
    (0, express_validator_1.check)("lastName", "Please enter you last name").not().isEmpty(),
    (0, express_validator_1.check)("email", "Please enter valid email").isEmail(),
    (0, express_validator_1.check)("password", "Please enter password").not().isEmpty(),
], userController_1.default.addNewUser);
router.post("/update", [
    (0, express_validator_1.check)("firstName", "Please enter you first name").not().isEmpty(),
    (0, express_validator_1.check)("lastName", "Please enter you last name").not().isEmpty(),
    (0, express_validator_1.check)("email", "Please enter valid email").isEmail(),
    (0, express_validator_1.check)("password", "Please enter password").not().isEmpty(),
], userController_1.default.updateUser);
router.delete("/delete/:email", [], userController_1.default.deleteUser);
router.post("/verifyToken", authMiddleware, userController_1.default.verifyToken);
module.exports = router;
