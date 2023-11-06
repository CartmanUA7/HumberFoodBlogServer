import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/Users";

const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ errors: "invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
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

    jwt.sign(
      payload,
      process.env.JWT_SECRET as jwt.Secret,
      { expiresIn: 36000 },
      (err, token) => {
        if (err) throw err;
        res.send({
          token,
          id: user?._id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
        });
      }
    );
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return res.status(500).send("Server error");
  }
};

const addNewUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(req.body.password, salt);
    await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email.toLowerCase(),
      password: newPassword,
    });

    res.status(200).send("User created successfully");
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return res.status(500).send("Server error");
  }
};

const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(400).json({});
    }
    const payload = jwt.decode(token) as JwtPayload;

    if (!payload || !payload.user) {
      return res.status(400).json({});
    }

    res.status(200).send({
      id: payload.user.id,
      firstName: payload.user.firstName,
      lastName: payload.user.lastName,
      email: payload.user.email,
    });
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return res.status(500).send("Server error");
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ errors: "user not found" });
    }

    // Update the user's information
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    if (password) {
      // Hash and update the password
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(password, salt);
      user.password = newPassword;
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully" });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const userEmail = req.params.email; // Retrieve the user's email from the request body
    const result = await User.deleteOne({ email: userEmail.toLowerCase() });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

const userController = {
  login,
  addNewUser,
  verifyToken,
  updateUser,
  deleteUser,
};

export default userController;
