import crypto from "node:crypto";
import { mySecretKey } from "./controllers/authController.js";
import User from "./models/userModel.js";
import Session from "./models/sessionModel.js";

export const checkAuth = async (req, res, next) => {
  const { sid } = req.signedCookies;
  if (!sid) {
    res.clearCookie("sid");
    return res.status(401).json({ message: "Not logged in!" });
  }
  const session = await Session.findById(sid);
  const user = await User.findOne({ _id: session.userId });
  if (!user) {
    return res.status(401).json({ message: "Not logged in!" });
  }
  req.user = user;
  next();
};
