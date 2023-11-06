"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Users_1 = require("../models/Users");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        let user = yield Users_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ errors: "invalid credentials" });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: "invalid credentials 2" });
        }
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };
        jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: 36000 }, (err, token) => {
            if (err)
                throw err;
            res.send({
                token,
                id: user === null || user === void 0 ? void 0 : user._id,
                firstName: user === null || user === void 0 ? void 0 : user.firstName,
                lastName: user === null || user === void 0 ? void 0 : user.lastName,
                email: user === null || user === void 0 ? void 0 : user.email,
            });
        });
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});
const addNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        let newPassword = yield bcryptjs_1.default.hash(req.body.password, salt);
        yield Users_1.User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email.toLowerCase(),
            password: newPassword,
        });
        res.status(200).send("User created successfully");
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});
const verifyToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(400).json({});
        }
        const payload = jsonwebtoken_1.default.decode(token);
        if (!payload || !payload.user) {
            return res.status(400).json({});
        }
        res.status(200).send({
            id: payload.user.id,
            firstName: payload.user.firstName,
            lastName: payload.user.lastName,
            email: payload.user.email,
        });
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { firstName, lastName, email, password } = req.body;
        let user = yield Users_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ errors: "user not found" });
        }
        // Update the user's information
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        if (password) {
            // Hash and update the password
            const salt = yield bcryptjs_1.default.genSalt(10);
            const newPassword = yield bcryptjs_1.default.hash(password, salt);
            user.password = newPassword;
        }
        yield user.save();
        res.status(200).json({ message: "User updated successfully" });
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Server error" });
    }
});
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = req.params.email; // Retrieve the user's email from the request body
        const result = yield Users_1.User.deleteOne({ email: userEmail.toLowerCase() });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).send("Server error");
    }
});
const userController = {
    login,
    addNewUser,
    verifyToken,
    updateUser,
    deleteUser,
};
exports.default = userController;
