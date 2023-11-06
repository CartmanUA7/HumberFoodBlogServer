"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoose = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.mongoose = mongoose_1.default;
const config_1 = require("./config");
mongoose_1.default
    .connect(config_1.config.db.uri, config_1.config.db.options)
    .then(() => console.log("MongoDB Connected.."))
    .catch((err) => console.log("Error connecting to DB" + err));
