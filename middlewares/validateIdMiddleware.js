import mongoose from "mongoose";

export default function validateIdMiddleware(req, res, next, id) {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: `Invalid ID: ${id}` });
  }
  next();
}
