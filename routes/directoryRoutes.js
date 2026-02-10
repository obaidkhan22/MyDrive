import express from 'express';
import { rm, writeFile } from 'fs/promises';
import directoriesData from '../directoriesDB.json' with { type: "json" };
import filesData from '../filesDB.json' with { type: "json" };
import validateIdMiddleware from '../middlewares/validateIdMiddleware.js';
import { ObjectId } from 'mongodb';

const router = express.Router()

router.param('parentDirId', validateIdMiddleware)
router.param('id', validateIdMiddleware)

//read  
router.get("/:id?", async (req, res) => {
  const db = req.db
  const _id = req.params.id ? new ObjectId(req.params.id) : req.user.rootDirId
  const dirCollection = db.collection('directories')
  const directoryData = await dirCollection.findOne({ _id })
  // if (directoryData.userId !== req.user._id) {
  //   return res.status(401).json({ message: "Not Authorized!" })
  // }
  if (!directoryData) return res.status(404).json({ message: "Directory not found." })
  const files = await db.collection("files").find({ parentDirId: directoryData._id }).toArray()

  const directories = await dirCollection.find({ parentDirId: _id }).toArray()
  return res.status(200).json({ ...directoryData, files: files.map((file) => ({ ...file, id: file._id })), directories: directories.map((dir) => ({ ...dir, id: dir._id })) })
});

//create
router.post("/:parentDirId?", async (req, res, next) => {
  try {
    const db = req.db
    const parentDirId = req.params.parentDirId || req.user.rootDirId

    const dirname = req.headers.dirname || "New Folder"
    const dirCollection = db.collection("directories")
    const parentDir = await dirCollection.findOne({ _id: new ObjectId(parentDirId) })
    if (!parentDir) return res.status(404).json({ message: "Parent Directory not found." })
    await dirCollection.insertOne({
      name: dirname,
      parentDirId,
      userId: req.user._id,
    })
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData))
    res.status(201).json({ message: "Directory created." })
  } catch (error) {
    next(error)
  }
})

//update
router.patch("/:dirId", async (req, res, next) => {
  try {
    const { dirId } = req.params
    const { newDirName } = req.body
    const db = req.db
    const directory = await db.collection("directories").updateOne({ _id: new ObjectId(dirId), userId: req.user._id }, { $set: { name: newDirName } })
    if (!directory) {
      return res.status(404).json({ message: "Directory not found!" })
    }
    return res.status(200).json({ message: "Directory renamed!" })
  } catch (error) {
    next(error)
  }
})

router.delete("/:id", async (req, res, next) => {
  const id = req.params.id
  try {
    //delete it from the json file
    const dirIndex = directoriesData.findIndex((dir) => dir.id === id)
    const dirData = directoriesData[dirIndex]
    if (dirData.userId !== req.user.id) {
      return res.status(401).json({ message: "Not Authorized!" })
    }
    directoriesData.splice(dirIndex, 1)

    //delete all the files inside the directory
    for await (const fileId of dirData.files) {
      const fileIndex = filesData.findIndex((file) => file.id === fileId)
      const fileData = filesData[fileIndex]
      await rm(`./storage/${fileData.id}${fileData.extension}`, { recursive: true })
      filesData.splice(fileIndex, 1)
    }

    //delete all the directories inside the directory

    for await (const dirId of dirData.directories) {
      const dirIndex = directoriesData.findIndex((dir) => dir.id === dirId)
      directoriesData.splice(dirIndex, 1)
    }

    const parentDirData = directoriesData.find((dir) => dir.id === dirData.parentDirId)
    parentDirData.directories = parentDirData.directories.filter((dirId) => dirId !== dirData.id)

    await writeFile(`./filesDB.json`, JSON.stringify(filesData))
    await writeFile(`./directoriesDB.json`, JSON.stringify(directoriesData))
    return res.status(200).json({ message: "Directory deleted!" })
  } catch (error) {
    next(error)
  }
})

export default router