import crypto from "node:crypto";
import { mySecretKey } from "./controllers/authController.js";
import User from "./models/userModel.js";

export const checkAuth = async (req, res, next) => {
  const { token } = req.signedCookies;
  console.log(token)
  if (!token) {
    res.clearCookie("token")
    return res.status(401).json({ message: "Not logged in!" });
  }
  const { id, expiry: expiryTimeInSeconds } = JSON.parse(Buffer.from(token, "base64url").toString());
  const currentTimeInSeconds = Math.round(Date.now() / 1000);
  if (currentTimeInSeconds > expiryTimeInSeconds) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Not logged in." });
  }
  const user = await User.findOne({ _id: id });
  if (!user) {
    return res.status(401).json({ message: "Not logged in!" });
  }
  req.user = user;
  next();
};
