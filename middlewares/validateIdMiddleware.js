import { ObjectId } from "mongodb";

export default function validateIdMiddleware(req, res, next, id) {
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid ID: ${id}` });
  }
  next();
}
