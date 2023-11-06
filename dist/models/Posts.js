"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const database_1 = require("../util/database");
const postSchema = new database_1.mongoose.Schema({
    title: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    author: { type: database_1.mongoose.Schema.Types.ObjectId, required: true },
    postTime: {
        type: Date,
        default: Date.now,
    },
    image: { type: String, required: true },
    categories: { type: String, required: true },
    likes: [database_1.mongoose.Schema.Types.ObjectId],
    comments: [
        {
            content: String,
            author: database_1.mongoose.Schema.Types.ObjectId,
            postTime: {
                type: Date,
                default: Date.now,
            },
            likes: [database_1.mongoose.Schema.Types.ObjectId],
        },
    ],
});
const Post = database_1.mongoose.model("Posts", postSchema);
exports.Post = Post;
