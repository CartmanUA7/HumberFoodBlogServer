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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const Posts_1 = require("./models/Posts");
const cors = require('cors');
const multer = require("multer");
const path_1 = __importDefault(require("path"));
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const app = (0, express_1.default)();
const port = 4000;
//app.use('/foodImages', express.static(path.join(__dirname, 'foodImages')));
app.use('/foodImages', express_1.default.static('foodImages'));
app.post('/insertData', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawData = fs_1.default.readFileSync(path_1.default.join(__dirname, '../data.json'), 'utf8');
        const jsonData = JSON.parse(rawData);
        // Insert the JSON data into the MongoDB collection
        const result = yield Posts_1.Post.create(jsonData);
        console.log('Data inserted into MongoDB');
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error reading or parsing JSON file or inserting data into MongoDB');
    }
}));
app.use(cors());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
    console.log('Backend Is running');
});
