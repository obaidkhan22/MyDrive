import express from 'express';
import { rm, writeFile } from 'fs/promises';
import directoriesData from '../directoriesDB.json' with { type: "json" };
import filesData from '../filesDB.json' with { type: "json" };
import usersData from '../usersDB.json' with {type: "json"}

const router = express.Router()

router.get("/:id?", async (req, res) => {
  const { uid } = req.cookies
  const user = usersData.find((user) => user.id === uid)
  if (!uid || !user) {
    return res.status(401).json({ message: "Not logged in!" })
  }
  const id = req.params.id || directoriesData[0].id
  let directoryData = directoriesData.find((folder) => folder.id === id)
  if (!directoryData) return res.status(404).json({ message: "Directory not found." })
  const files = directoryData.files.map((fileId) => filesData.find((file) => fileId === file.id))
  const directories = directoryData.directories.map((dir) => directoriesData.find((dirId) => dir === dirId.id))
  return res.status(200).json({ ...directoryData, files, directories })
});

router.post("/:parentDirId?", async (req, res, next) => {
  const parentDirId = req.params.parentDirId || directoriesData[0].id
  console.log(parentDirId)
  const dirname = req.headers.dirname || "New Folder"
  const id = crypto.randomUUID()
  const parentDir = directoriesData.find((dir) => dir.id === parentDirId)
  console.log(parentDir)
  if (!parentDir) return res.status(404).json({ message: "Parent Directory not found." })
  parentDir.directories.push(id)
  directoriesData.push({
    id,
    name: dirname,
    parentDirId,
    files: [],
    directories: []
  })
  try {
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData))
    res.status(201).json({ message: "Directory created." })
  } catch (error) {
    next(error)
  }
})

router.patch("/:dirId", async (req, res, next) => {
  const { dirId } = req.params
  const { newDirName } = req.body

  const dirIndex = directoriesData.findIndex((dir) => dir.id === dirId)
  const dirData = directoriesData[dirIndex]
  if (!dirData) return res.status(404).json({ message: "Directory not found." })
  dirData.name = newDirName
  try {
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData))
    res.status(200).json({ message: "Directory renamed!" })

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