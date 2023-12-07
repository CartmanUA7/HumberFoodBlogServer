"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = __importDefault(require("../controllers/postController"));
const express_validator_1 = require("express-validator");
const authMiddleware = require('../middlewares/authMiddleware');
const multiparty = require('connect-multiparty'), multipartyMiddleware = multiparty({ uploadDir: './foodImages' });
const router = express_1.default.Router();
router.get("/getPosts", postController_1.default.getPosts);
router.get("/getPost/:postId", postController_1.default.getPost);
router.post("/newPost", authMiddleware, 
//multipartyMiddleware,
[
    (0, express_validator_1.check)("title", "Please enter title").not().isEmpty(),
    (0, express_validator_1.check)("content", "Please enter content").not().isEmpty(),
    (0, express_validator_1.check)("categories", "Please enter category").not().isEmpty(),
], postController_1.default.newPost);
router.post("/editPost/:postId", authMiddleware, multipartyMiddleware, [
    (0, express_validator_1.check)('title', 'Please enter title').not().isEmpty(),
    (0, express_validator_1.check)('content', 'Please enter content').not().isEmpty()
], postController_1.default.editPost);
router.post("/deletePost/:postId", authMiddleware, postController_1.default.deletePost);
router.post("/likePost/:postId", authMiddleware, postController_1.default.likePost);
router.post("/newComment/:postId", authMiddleware, [
    (0, express_validator_1.check)('content', 'Please enter content').not().isEmpty()
], postController_1.default.newComment);
router.post("/editComment/:postId/:commentId", authMiddleware, [
    (0, express_validator_1.check)('content', 'Please enter content').not().isEmpty()
], postController_1.default.editComment);
router.post("/deleteComment/:postId/:commentId", authMiddleware, postController_1.default.deleteComment);
router.post("/likeComment/:postId/:commentId", authMiddleware, postController_1.default.likeComment);
module.exports = router;
