import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import mongoose from "mongoose";
import { Types } from "mongoose";
import bcrypt from 'bcrypt'
export const mySecretKey = "Obaidullah";
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction()
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        error: "User already exists.",
        message: "Register with a different email.",
      });
    }
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        password: hashedPassword,
        rootDirId,
      },
      { session },
    );
    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session },
    );
    await session.commitTransaction();
    return res.status(201).json({ message: "User Registered" });
  } catch (error) {
    session.abortTransaction();
    if (error.code === 121) {
      return res
        .status(400)
        .json({ error: "Invalid Input. Please enter valid details." });
    } else {
      next(error);
    }
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Invalid Credentials." });
    }
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(404).json({ error: "Invalid Credentials." });

    }
    const cookiePayload = JSON.stringify({
      id: user._id.toString(),
      expiry: Math.round(Date.now() / 1000 + 1000),
    });
    res.cookie("token", Buffer.from(cookiePayload).toString("base64url"), {
      maxAge: 60 * 60 * 10000,
      sameSite: "none",
      signed: true,
      secure: true,
      httpOnly: true,
    });
    res.status(200).json({ message: "Login Successfully" });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("uid");
  res.status(204).end();
};

export const getUserProfile = (req, res) => {
  return res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};
