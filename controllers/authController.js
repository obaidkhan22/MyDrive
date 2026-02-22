import { ObjectId } from "mongodb";
import { client } from "../config/db.js";
import crypto from "node:crypto";
export const mySecretKey = "Obaidullah";
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  const session = client.startSession();
  try {
    const db = req.db;
    const user = await db.collection("users").findOne({ email });
    if (user) {
      return res.status(409).json({
        error: "User already exists.",
        message: "Register with a different email.",
      });
    }
    const rootDirId = new ObjectId();
    const userId = new ObjectId();

    await db.collection("users").insertOne(
      {
        _id: userId,
        name,
        email,
        password,
        rootDirId,
      },
      { session },
    );
    await db.collection("directories").insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session },
    );
    session.commitTransaction();
    return res.status(201).json({ message: "User  Registered" });
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
    const db = req.db;
    const user = await db.collection("users").findOne({ email });
    if (!user || user.password !== password) {
      return res.status(404).json({ error: "Invalid Credentials." });
    }

    const cookiePayload = JSON.stringify({
      id: user._id.toString(),
      expiry: Math.round(Date.now() / 1000 + 1000),
    });
    const signature = crypto
      .createHash("sha256")
      .update(mySecretKey)
      .update(cookiePayload)
      .update(mySecretKey)
      .digest("base64url");

    const signedCookie = `${Buffer.from(cookiePayload).toString("base64url")}.${signature}`;
    res.cookie("token", signedCookie, {
      maxAge: 60 * 60 * 1000,
      sameSite: "none",
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
