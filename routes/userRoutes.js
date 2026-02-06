import { Router } from "express";
import usersData from '../usersDB.json' with {type: "json"}
import directoriesData from '../directoriesDB.json' with {type: "json"}
import { writeFile } from "node:fs/promises";
import { checkAuth } from '../authMiddleware.js'
const router = Router()

router.post('/register', async (req, res, next) => {
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
      id: userId,
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

router.post('/login', (req, res) => {
   const { email, password } = req.body

   const user = usersData.find((user) => user.email === email)
   if (!user || user.password !== password) {
      return res.status(404).json({ message: "Invalid Credentials." })
   }
   res.cookie("uid", user.id, {
      maxAge: 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
      httpOnly: true
   })
   res.status(200).json({ message: "Login Successfully" })
})


router.post("/logout", (req, res) => {
   res.clearCookie("uid")
   res.status(204).end()

})


router.get('/', checkAuth, (req, res) => {
   return res.status(200).json({
      name: req.user.name,
      email: req.user.email
   })
})
export default router