import express from 'express'
import { createWriteStream } from "fs";
import { rename, rm, writeFile } from "fs/promises";
import path from 'path';
import filesData from '../filesDB.json' with {type: "json"}
import directoriesData from '../directoriesDB.json' with {type: "json"}

const router = express.Router()

router.param('parentDirId', validateIdMiddleware)
router.param('id', validateIdMiddleware)

// Create
router.post("/:parentDirId?", (req, res) => {
  const parentDirId = req.params['parentDirId'] || req.user.rootDirId

  const filename = req.headers.filename || "untitled"
  const extension = path.extname(filename)
  const id = crypto.randomUUID()
  const fullName = id + extension
  const writeStream = createWriteStream(`./storage/${fullName}`);
  req.pipe(writeStream);
  req.on("end", async () => {
    filesData.push({
      id,
      extension,
      userId: req.user.id,
      name: filename,
      parentDirId
    })
    const fileDir = directoriesData.find((dir) => dir.id === parentDirId)
    fileDir.files.push(id)
    try {
      await writeFile('./filesDB.json', JSON.stringify(filesData))
      await writeFile('./directoriesDB.json', JSON.stringify(directoriesData))
      return res.status(201).json({ message: "File Uploaded" });

    } catch (error) {
      return res.status(500).json({ message: "Could not save file." })
    }
  });
});

//Read
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const fileData = filesData.find((file) => file.id === id)
  if (fileData.userId !== req.user.id) {
    return res.status(401).json({ message: "You don't have access to this recourse." })
  }
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
  const file = filesData.find((file) => file.id === id)
  if (file.userId !== req.user.id) {
    return res.status(401).json({ message: "Not authorized!" })
  }
  file.name = newFilename

  try {

    await writeFile('./filesDB.json', JSON.stringify(filesData))
    return res.status(200).json({ message: "Renamed" });
  } catch (error) {
    error.status = 500
    next(error)
  }
});
// Delete
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params
  const fileIndex = filesData.findIndex((file) => file.id === id)
  if (fileIndex === -1) return res.status(404).json({ message: "File not found." })
  const fileData = filesData[fileIndex]
  if (fileData.userId !== req.user.id) {
    return res.status(401).json({ message: "Not authorized!" })
  }
  try {
    await rm(`./storage/${id}${fileData.extension}`, { recursive: true });
    filesData.splice(fileIndex, 1)
    const parentDirData = directoriesData.find((directoryData) => directoryData.id === fileData.parentDirId)
    parentDirData.files = parentDirData.files.filter((fileId) => fileId !== id)
    console.log(parentDirData.files);
    await writeFile('./filesDB.json', JSON.stringify(filesData))
    await writeFile('./directoriesDB.json', JSON.stringify(directoriesData))
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err)
  }
});

export default router