import { Router } from "express";
import { checkAuth } from "../authMiddleware.js";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController.js";

const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/", checkAuth, getUserProfile);
export default router;
