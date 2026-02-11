import express from 'express';
import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import { ObjectId } from 'mongodb';
import path from 'path';
import validateIdMiddleware from '../middlewares/validateIdMiddleware.js';
const router = express.Router()

router.param('parentDirId', validateIdMiddleware)
router.param('id', validateIdMiddleware)

// Create 
router.post("/:parentDirId?", async (req, res) => {
  const parentDirId = req.params['parentDirId'] || req.user.rootDirId
  const db = req.db
  const dirCollection = db.collection("directories")
  const filesCollection = db.collection("files")
  const parentDirData = await dirCollection.findOne({ _id: new ObjectId(parentDirId), userId: req.user._id })
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory not found!" })
  }
  const filename = req.headers.filename || "untitled"
  const extension = path.extname(filename)
  const { insertedId } = await filesCollection.insertOne({
    extension,
    name: filename,
    parentDirId: parentDirData._id,
    userId: req.user._id
  })
  const fullName = `${insertedId.toString()}${extension}`
  const writeStream = createWriteStream(`./storage/${fullName}`);
  req.pipe(writeStream);
  req.on("end", async () => {
    return res.status(201).json({ message: "File Uploaded" })
  });
  req.on("error", async () => {
    console.log("error")
    await filesCollection.deleteOne({ _id: insertedId })
    return res.status(400).json("Could not upload file ")
  })
});

//Read
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const db = req.db
  const fileData = await db.collection("files").findOne({ _id: new ObjectId(id), userId: req.user._id })
  if (!fileData) return res.status(404).json({ message: "File not found!" })
  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`
  if (req.query.action === "download") {
    return res.download(filePath, fileData.name);
  }
  return res.sendFile(filePath, (err) => {
    if (!res.setHeaders && err) {
      return res.status(404).json({ error: "File not found!" })
    }
  });
});

// Update
router.patch("/:id", async (req, res, next) => {
  const { id } = req.params
  const { newFilename } = req.body
  const db = req.db
  try {
    const file = await db.collection("files").findOne({ _id: new ObjectId(id), userId: req.user._id })
    if (!file) return res.status(404).json({ error: "File not found." })
    await db.collection("files").updateOne({ _id: new ObjectId(id) }, { $set: { name: newFilename || "untitled" } })
    return res.status(200).json({ message: "Renamed" });
  } catch (error) {
    error.status = 500
    next(error)
  }
});
// Delete
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params
  const db = req.db
  try {
    const file = await db.collection("files").findOne({ _id: new ObjectId(id), userId: req.user._id })
    if (!file) return res.status(404).json({ error: "File not found." })
    await db.collection("files").deleteOne({ _id: new ObjectId(id) })
    await rm(`./storage/${id}${file.extension}`
    );
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err)
  }
});

export default router