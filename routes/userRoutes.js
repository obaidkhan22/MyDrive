import { Router } from "express";
import { checkAuth } from '../authMiddleware.js'
const router = Router()

router.post('/register', async (req, res, next) => {
   const { name, email, password } = req.body
   try {
      const db = req.db
      const user = await db.collection("users").find({ email })
      if (user) {
         return res.status(409).json({ error: "User already exists.", message: "Register with a different email." })
      }
      const { insertedId: rootDirId } = await db.collection("directories").insertOne({
         name: `root-${email}`,
         parentDirId: null,
         files: [],
         directories: []
      })

      const { insertedId: userId } = await db.collection("users").insertOne({
         name,
         email,
         password,
         rootDirId
      })
      await db.collection("directories").updateOne({ _id: rootDirId }, { $set: { userId } })
      return res.status(201).json({ message: "User  Registered" })
   } catch (error) {
      next(error)
   }
})

router.post('/login', async (req, res, next) => {
   try {
      const { email, password } = req.body
      const db = req.db
      const user = await db.collection("users").findOne({ email })
      if (!user || user.password !== password) {
         return res.status(404).json({ error: "Invalid Credentials." })
      }
      const userId = user._id.id.toString()
      res.cookie("uid", userId, {
         maxAge: 60 * 60 * 1000,
         sameSite: "none",
         secure: true,
         httpOnly: true
      })
      res.status(200).json({ message: "Login Successfully" })

   } catch (error) {
      next(error)
   }
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