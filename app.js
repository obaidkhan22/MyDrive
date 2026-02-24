import cors from "cors";
import express from "express";
import fileRoutes from "./routes/fileRoutes.js";
import directoryRoutes from "./routes/directoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import { checkAuth } from "./authMiddleware.js";
import { connectDB } from "./config/db.js";
import "./config/mongooseConnect.js";
const db = await connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use((req, res, next) => {
  req.db = db;
  next();
});
app.use("/file", checkAuth, fileRoutes);
app.use("/directory", checkAuth, directoryRoutes);
app.use("/user", userRoutes);

app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({ error: err.message });
});

app.listen(4000, () => {
  console.log(`Server Started`);
});
