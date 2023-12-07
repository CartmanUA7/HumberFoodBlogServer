import express from 'express';
import postController from '../controllers/postController';
import { check } from 'express-validator';

const authMiddleware = require('../middlewares/authMiddleware');
const multiparty = require('connect-multiparty'),
multipartyMiddleware = multiparty({ uploadDir: './foodImages' });

const router = express.Router();

router.get("/getPosts", postController.getPosts);
router.get("/getPost/:postId", postController.getPost);

router.post(
  "/newPost",
  authMiddleware,
  multipartyMiddleware,
  [
    check("title", "Please enter title").not().isEmpty(),
    check("content", "Please enter content").not().isEmpty(),
    check("categories", "Please enter category").not().isEmpty(),
  ],
  postController.newPost
);

router.post(
    "/editPost/:postId",
    authMiddleware,
    multipartyMiddleware,
    [
        check('title', 'Please enter title').not().isEmpty(),
        check('content', 'Please enter content').not().isEmpty()
    ],
    postController.editPost
);

router.post(
    "/deletePost/:postId",
    authMiddleware,
    postController.deletePost
);

router.post(
    "/likePost/:postId", 
    authMiddleware, 
    postController.likePost
);

router.post(
    "/newComment/:postId",
    authMiddleware,
    [
        check('content', 'Please enter content').not().isEmpty()
    ],
    postController.newComment
);

router.post(
    "/editComment/:postId/:commentId",
    authMiddleware,
    [
        check('content', 'Please enter content').not().isEmpty()
    ],
    postController.editComment
);

router.post(
    "/deleteComment/:postId/:commentId",
    authMiddleware,
    postController.deleteComment
);

router.post(
  "/likeComment/:postId/:commentId",
  authMiddleware,
  postController.likeComment
);

module.exports = router;