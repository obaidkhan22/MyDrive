import { Router } from "express";
import { checkAuth } from "../authMiddleware.js";
import { ObjectId } from "mongodb";
const router = Router();

router.post("/register", async (req, res, next) => {
  const { name, email, password } = req.body;
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
    await db.collection("directories").insertOne({
      _id: rootDirId,
      name: `root-${email}`,
      parentDirId: null,
      userId,
    });

    await db.collection("users").insertOne({
      _id: userId,
      name,
      email,
      password,
      rootDirId,
    });
    return res.status(201).json({ message: "User  Registered" });
  } catch (error) {
    if (error.code === 121) {
      return res
        .status(400)
        .json({ error: "Invalid Input. Please enter valid details." });
    } else {
      next(error);
    }
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const db = req.db;
    const user = await db.collection("users").findOne({ email });
    if (!user || user.password !== password) {
      return res.status(404).json({ error: "Invalid Credentials." });
    }
    const userId = user._id.toString();
    res.cookie("uid", userId, {
      maxAge: 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });
    res.status(200).json({ message: "Login Successfully" });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("uid");
  res.status(204).end();
});
router.get("/", checkAuth, (req, res) => {
  return res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
});
export default router;
