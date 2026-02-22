import { ObjectId } from "mongodb";
import crypto from "node:crypto";
import { mySecretKey } from "./controllers/authController.js";

export const checkAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Not logged in!" });
  }
  const [payload, oldSignature] = token.split(".");
  const jsonPayload = Buffer.from(payload, "base64url").toString();
  const newSignature = crypto
    .createHash("sha256")
    .update(mySecretKey)
    .update(jsonPayload)
    .update(mySecretKey)
    .digest("base64url");

  if (oldSignature !== newSignature) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Not logged in." });
  }
  const { id, expiry: expiryTimeInSeconds } = JSON.parse(jsonPayload);
  const currentTimeInSeconds = Math.round(Date.now() / 1000);
  if (currentTimeInSeconds > expiryTimeInSeconds) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Not logged in." });
  }
  const db = req.db;
  const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
  if (!user) {
    return res.status(401).json({ message: "Not logged in!" });
  }
  req.user = user;
  next();
};
