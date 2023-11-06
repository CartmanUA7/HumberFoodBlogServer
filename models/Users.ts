import { mongoose } from "../util/database";

interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  }
);

const User = mongoose.model("Users", userSchema);

export { User }