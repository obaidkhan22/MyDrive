import { Router } from "express";
import usersData from '../usersDB.json' with {type: "json"}
import directoriesData from '../directoriesDB.json' with {type: "json"}
import { writeFile } from "node:fs/promises";

const router = Router()

router.post('/', async (req, res, next) => {
   const { name, email, password } = req.body
   const user = usersData.find((user) => user.email === email)
   if (user) return res.status(409).json({ error: "User already exists.", message: "Register with a different email." })
   const dirId = crypto.randomUUID()
   const userId = crypto.randomUUID()
   directoriesData.push({
      id: dirId,
      name: `root-${email}`,
      userId,
      parentDirId: null,
      files: [],
      directories: []
   })
   usersData.push({
      name,
      email,
      password,
      rootDirId: dirId
   })
   try {
      await writeFile('./directoriesDB.json', JSON.stringify(directoriesData))
      await writeFile('./usersDB.json', JSON.stringify(usersData))
      res.status(201).json({ message: "User  Registered" })
   } catch (error) {
      next(error)
   }
})

export default router