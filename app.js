import express from "express";
import { readdir } from "fs/promises";

const app = express();

// Enabling CORS
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});








// Serving Dir Content
app.get("/", async (req, res) => {
  const filesList = await readdir("./storage");
  res.json(filesList);
});

app.listen(4000, () => {
  console.log(`Server Started`);
});