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
const Posts_1 = require("../models/Posts");
const mongoose_1 = __importDefault(require("mongoose"));
const Users_1 = require("../models/Users");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});
const deleteImage = (path) => {
    cloudinary.uploader.destroy(path);
};
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Posts_1.Post.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "users",
                },
            },
        ]);
        const users = yield Users_1.User.find();
        posts.forEach((e) => {
            e.authorName =
                e.users.length > 0
                    ? `${e.users[0].firstName} ${e.users[0].lastName}`
                    : "Unknown";
            e.comments.forEach((com) => {
                const commentUser = users.find((u) => u._id.toString() == com.author);
                com.authorName = commentUser
                    ? `${commentUser.firstName} ${commentUser.lastName}`
                    : "Unknown";
            });
            delete e.users;
        });
        res.status(200).json(posts);
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});
const getPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const post = yield Posts_1.Post.findById(postId);
        res.status(200).json(post);
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});
const newPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const multipartRequest = req;
    const { title, content, categories } = req.body;
    const token = multipartRequest.token;
    const file = multipartRequest.file;
    try {
        const post = new Posts_1.Post({
            author: token.user.id,
            title,
            content,
            comments: [],
            image: file.path,
            categories,
            likes: [],
        });
        console.log(post);
        const savedPost = yield post.save();
        if (savedPost) {
            res.status(200).json(savedPost);
        }
        else {
            const filePathParts = file.path.split("/");
            const fileName = filePathParts[filePathParts.length - 1].split(".")[0];
            deleteImage(`FoodBlog/${fileName}`);
            res.status(500).send("Server error");
        }
    }
    catch (err) {
        const e = err;
        console.log(e);
        const filePathParts = file.path.split("/");
        const fileName = filePathParts[filePathParts.length - 1].split(".")[0];
        deleteImage(`FoodBlog/${fileName}`);
        if (e.message.startsWith("E11000")) {
            return res.status(400).send("Title already exists");
        }
        return res.status(500).send("Server error");
    }
});
const editPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const multipartRequest = req;
    const postId = multipartRequest.params.postId;
    const { title, content, categories } = multipartRequest.body;
    const token = multipartRequest.token;
    const file = multipartRequest.file;
    try {
        let post = yield Posts_1.Post.findById(postId);
        if (post == null) {
            res.status(501).send("Post does not exist");
            return;
        }
        if (post.author != token.user.id) {
            res.status(403).send("Access denied");
            return;
        }
        post.title = title;
        post.content = content;
        post.categories = categories;
        let oldImage = "";
        if (file) {
            oldImage = post.image;
            post.image = file.path;
        }
        const updatedPost = yield post.save();
        if (updatedPost) {
            if (oldImage) {
                console.log(oldImage);
                const filePathParts = oldImage.split("/");
                const fileName = filePathParts[filePathParts.length - 1].split(".")[0];
                deleteImage(`FoodBlog/${fileName}`);
            }
            res.status(200).json(updatedPost);
        }
        else {
            if (file) {
                const filePathParts = file.path.split("/");
                const fileName = filePathParts[filePathParts.length - 1].split(".")[0];
                deleteImage(`FoodBlog/${fileName}`);
            }
            res.status(500).send("Server error");
        }
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        if (file) {
            const filePathParts = file.path.split("/");
            const fileName = filePathParts[filePathParts.length - 1].split(".")[0];
            deleteImage(`FoodBlog/${fileName}`);
        }
        return res.status(500).send("Server error");
    }
});
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const token = req.token;
        const post = yield Posts_1.Post.findById(postId);
        if (post == null) {
            res.status(501).send("Post does not exist");
            return;
        }
        if (post.author != token.user.id) {
            res.status(403).send("Access denied");
            return;
        }
        const result = yield Posts_1.Post.deleteOne({ _id: post._id });
        if (result.acknowledged) {
            const filePathParts = post.image.split("/");
            const filePath = "FoodBlog/" +
                filePathParts[filePathParts.length - 1].split(".")[0];
            deleteImage(filePath);
            res.status(200).send("Post deleted successfully");
        }
        else {
            res.status(500).send("Server error");
        }
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const token = req.token;
        const post = yield Posts_1.Post.findById(postId);
        if (post == null) {
            res.status(501).send("Post does not exist");
            return;
        }
        if (post.likes.includes(token.user.id)) {
            res.status(403).send("Already liked");
            return;
        }
        const result = yield Posts_1.Post.updateOne({ _id: post._id }, {
            $push: { likes: token.user.id },
        });
        if (result.acknowledged && result.modifiedCount > 0) {
            res.status(200).send("Post liked successfully");
        }
        else {
            res.status(500).send("Server error");
        }
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});
const newComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const { content } = req.body;
        const token = req.token;
        const post = yield Posts_1.Post.findById(postId);
        if (post == null) {
            res.status(501).send("Post does not exist");
            return;
        }
        const comment = {
            _id: new mongoose_1.default.Types.ObjectId(),
            author: token.user.id,
            content,
            postTime: new Date(Date.now()).toJSON(),
            likes: []
        };
        const result = yield Posts_1.Post.updateOne({ _id: post._id }, {
            $push: { comments: comment },
        });
        if (result.acknowledged && result.modifiedCount > 0) {
            res.status(200).json(comment);
        }
        else {
            res.status(500).send("Server error");
        }
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});
const editComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const { content } = req.body;
        const token = req.token;
        const post = yield Posts_1.Post.findById(postId);
        if (post == null) {
            res.status(501).send("Post does not exist");
            return;
        }
        const result = yield Posts_1.Post.updateOne({ _id: post._id }, {
            $set: { "comments.$[id].content": content },
        }, {
            arrayFilters: [
                {
                    "id._id": commentId,
                    "id.author": token.user.id,
                },
            ],
        });
        if (result.acknowledged && result.modifiedCount > 0) {
            res.status(200).send("Comment updated successfully");
        }
        else {
            res.status(500).send("Server error");
        }
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const token = req.token;
        const post = yield Posts_1.Post.findById(postId);
        if (post == null) {
            res.status(501).send("Post does not exist");
            return;
        }
        const result = yield Posts_1.Post.updateOne({ _id: post._id }, {
            $pull: {
                comments: {
                    _id: commentId,
                    author: token.user.id,
                },
            },
        });
        if (result.acknowledged && result.modifiedCount > 0) {
            res.status(200).send("Comment deleted successfully");
        }
        else {
            res.status(500).send("Server error");
        }
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});
const likeComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const token = req.token;
        const post = yield Posts_1.Post.findById(postId);
        if (post == null) {
            res.status(501).send("Post does not exist");
            return;
        }
        const comment = post.comments.find(e => e._id.toString() == commentId);
        if (!comment || comment.likes.includes(token.user.id)) {
            res.status(403).send("Already liked");
            return;
        }
        comment.likes.push(token.user.id);
        const saved = yield post.save();
        if (saved) {
            res.status(200).send("Comment liked successfully");
        }
        else {
            res.status(500).send("Server error");
        }
    }
    catch (err) {
        const e = err;
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});
const postController = {
    getPosts,
    getPost,
    newPost,
    editPost,
    deletePost,
    likePost,
    newComment,
    editComment,
    deleteComment,
    likeComment,
};
exports.default = postController;
