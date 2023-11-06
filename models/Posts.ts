import { mongoose } from "../util/database";

interface IComment {
  _id: mongoose.Schema.Types.ObjectId;
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  postTime: Date;
  likes: [mongoose.Schema.Types.ObjectId];
}

interface IPost {
  title: String;
  content: String;
  author: mongoose.Schema.Types.ObjectId;
  postTime: Date;
  comments: [IComment];
  image: string;
  categories: string;
  likes: [mongoose.Schema.Types.ObjectId];
}

const postSchema = new mongoose.Schema<IPost>({
  title: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, required: true },
  postTime: {
    type: Date,
    default: Date.now,
  },
  image: { type: String, required: true },
  categories: { type: String, required: true },
  likes: [mongoose.Schema.Types.ObjectId],
  comments: [
    {
      content: String,
      author: mongoose.Schema.Types.ObjectId,
      postTime: {
        type: Date,
        default: Date.now,
      },
      likes: [mongoose.Schema.Types.ObjectId],
    },
  ],
});

const Post = mongoose.model("Posts", postSchema);

export { Post }