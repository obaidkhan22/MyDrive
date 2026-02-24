import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import File from "../models/fileModel.js";
import Directory from "../models/directoryModel.js";
export const createFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  const parentDirData = await Directory.findOne({
    _id: parentDirId,
    userId: req.user._id,
  });

  // Check if parent directory exists
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }

  const filename = req.headers.filename || "untitled";
  const extension = path.extname(filename);

  const insertedFile = await File.insertOne({
    extension,
    name: filename,
    parentDirId: parentDirData._id,
    userId: req.user._id,
  });
  const fileId = insertedFile.id;
  const fullFileName = `${fileId}${extension}`;

  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);

  req.on("end", async () => {
    return res.status(201).json({ message: "File Uploaded" });
  });

  req.on("error", async () => {
    await File.deleteOne();
    return res.status(404).json({ message: "Could not Upload File" });
  });
};

export const getFile = async (req, res) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).select("extension name");
  // Check if file exists
  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }
  const filePath = `${process.cwd()}/storage/${id}${file.extension}`;

  if (req.query.action === "download") {
    return res.download(filePath, file.name);
  }

  // Send file
  return res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: "File not found!" });
    }
  });
};

export const renameFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await File.findOne({
      _id: id,
      userId: req.user._id,
    });

    // Check if file exists
    if (!file) {
      return res.status(404).json({ error: "File not found!" });
    }
    file.name = req.body.newFilename;
    await file.save();
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await File.findOne({
      _id: id,
      userId: req.user._id,
    }).select("extension");

    if (!file) {
      return res.status(404).json({ error: "File not found!" });
    }
    await rm(`./storage/${id}${file.extension}`);
    await file.deleteOne();
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};
