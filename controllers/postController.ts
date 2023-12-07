import { Request, Response } from "express";
import { Post } from "../models/Posts";
import { AuthRequest } from "../middlewares/authMiddleware";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import * as fs from "fs";
import { User } from "../models/Users";

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

interface MultipartRequest extends AuthRequest {
  file: {
    fieldName: string;
    originalFilename: string;
    path: string;
    headers: {
      "content-disposition": string;
      "content-type": string;
    };
    size: number;
    name: string;
    type: string;
  };
}

const deleteImage = (path: string) => {
  cloudinary.uploader.destroy(path);
};

const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "users",
        },
      },
    ]);
    const users = await User.find();

    posts.forEach(
      (e) => {
        e.authorName =
          e.users.length > 0
            ? `${e.users[0].firstName} ${e.users[0].lastName}`
            : "Unknown";
        
        e.comments.forEach((com: { author: string; authorName: string; }) => {
          const commentUser = users.find((u) => u._id.toString() == com.author);
          com.authorName = commentUser
            ? `${commentUser.firstName} ${commentUser.lastName}`
            : "Unknown";
        });

        delete e.users;
      }  
    );
    
    res.status(200).json(posts);
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return res.status(500).send("Server error");
  }
};

const getPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    res.status(200).json(post);
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return res.status(500).send("Server error");
  }
};

const newPost = async (req: Request, res: Response) => {
  const multipartRequest = req as MultipartRequest;

  const { title, content, categories } = req.body;
  const token = multipartRequest.token as JwtPayload;
  const file = multipartRequest.file;

  try {
    const post = new Post({
      author: token.user.id,
      title,
      content,
      comments: [],
      image: file.path,
      categories,
      likes: [],
    });
    console.log(post);
    const savedPost = await post.save();

    if (savedPost) {
      res.status(200).json(savedPost);
    } else {
      const filePathParts = file.path.split("/");
      const fileName = filePathParts[filePathParts.length - 1].split(".")[0];
      deleteImage(`FoodBlog/${fileName}`);
      res.status(500).send("Server error");
    }
  } catch (err) {
    const e = err as Error;
    console.log(e);
    const filePathParts = file.path.split("/");
    const fileName = filePathParts[filePathParts.length - 1].split(".")[0];
    deleteImage(`FoodBlog/${fileName}`);
    if (e.message.startsWith("E11000")) {
      return res.status(400).send("Title already exists");
    }
    return res.status(500).send("Server error");
  }
};

const editPost = async (req: Request, res: Response) => {
  const multipartRequest = req as MultipartRequest;

  const postId = multipartRequest.params.postId;
  const { title, content, categories } = multipartRequest.body;
  const token = multipartRequest.token as JwtPayload;
  const file = multipartRequest.file;

  try {
    let post = await Post.findById(postId);

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

    const updatedPost = await post.save();

    if (updatedPost) {
      if (oldImage) {
        console.log(oldImage);
        const filePathParts = oldImage.split("/");
        const fileName = filePathParts[filePathParts.length - 1].split(".")[0];
        deleteImage(`FoodBlog/${fileName}`);
      }
      res.status(200).json(updatedPost);
    } else {
      if (file) {
        const filePathParts = file.path.split("/");
        const fileName = filePathParts[filePathParts.length - 1].split(".")[0];
        deleteImage(`FoodBlog/${fileName}`);
      }
      res.status(500).send("Server error");
    }
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    if (file) {
      const filePathParts = file.path.split("/");
      const fileName = filePathParts[filePathParts.length - 1].split(".")[0];
      deleteImage(`FoodBlog/${fileName}`);
    }
    return res.status(500).send("Server error");
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const token = (req as AuthRequest).token as JwtPayload;

    const post = await Post.findById(postId);

    if (post == null) {
      res.status(501).send("Post does not exist");
      return;
    }

    if (post.author != token.user.id) {
      res.status(403).send("Access denied");
      return;
    }
    
    const result = await Post.deleteOne({ _id: post._id });

    if (result.acknowledged) {
      const filePathParts = post.image.split("/");
      const filePath = "FoodBlog/" +
        filePathParts[filePathParts.length - 1].split(".")[0];
      deleteImage(filePath);
      res.status(200).send("Post deleted successfully");
    } else {
      res.status(500).send("Server error");
    }
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return res.status(500).send("Server error");
  }
};

const likePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const token = (req as AuthRequest).token as JwtPayload;
    const post = await Post.findById(postId);

    if (post == null) {
      res.status(501).send("Post does not exist");
      return;
    }

    if (post.likes.includes(token.user.id)) {
      res.status(403).send("Already liked");
      return;
    }

    const result = await Post.updateOne(
      { _id: post._id },
      {
        $push: { likes: token.user.id },
      }
    );

    if (result.acknowledged && result.modifiedCount > 0) {
      res.status(200).send("Post liked successfully");
    } else {
      res.status(500).send("Server error");
    }
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return res.status(500).send("Server error");
  }
};

const newComment = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const { content } = req.body;
    const token = (req as AuthRequest).token as JwtPayload;

    const post = await Post.findById(postId);

    if (post == null) {
      res.status(501).send("Post does not exist");
      return;
    }

    const comment = {
      _id: new mongoose.Types.ObjectId(),
      author: token.user.id,
      content,
      postTime: new Date(Date.now()).toJSON(),
      likes: []
    };

    const result = await Post.updateOne(
      { _id: post._id },
      {
        $push: { comments: comment },
      }
    );

    if (result.acknowledged && result.modifiedCount > 0) {
      res.status(200).json(comment);
    } else {
      res.status(500).send("Server error");
    }
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return res.status(500).send("Server error");
  }
};

const editComment = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const { content } = req.body;
    const token = (req as AuthRequest).token as JwtPayload;

    const post = await Post.findById(postId);

    if (post == null) {
      res.status(501).send("Post does not exist");
      return;
    }

    const result = await Post.updateOne(
      { _id: post._id },
      {
        $set: { "comments.$[id].content": content },
      },
      {
        arrayFilters: [
          {
            "id._id": commentId,
            "id.author": token.user.id,
          },
        ],
      }
    );

    if (result.acknowledged && result.modifiedCount > 0) {
      res.status(200).send("Comment updated successfully");
    } else {
      res.status(500).send("Server error");
    }
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return res.status(500).send("Server error");
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const token = (req as AuthRequest).token as JwtPayload;

    const post = await Post.findById(postId);

    if (post == null) {
      res.status(501).send("Post does not exist");
      return;
    }

    const result = await Post.updateOne(
      { _id: post._id },
      {
        $pull: {
          comments: {
            _id: commentId,
            author: token.user.id,
          },
        },
      }
    );

    if (result.acknowledged && result.modifiedCount > 0) {
      res.status(200).send("Comment deleted successfully");
    } else {
      res.status(500).send("Server error");
    }
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return res.status(500).send("Server error");
  }
};

const likeComment = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const token = (req as AuthRequest).token as JwtPayload;
    const post = await Post.findById(postId);

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
    const saved = await post.save();

    if (saved) {
      res.status(200).send("Comment liked successfully");
    } else {
      res.status(500).send("Server error");
    }
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return res.status(500).send("Server error");
  }
};

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

export default postController;
