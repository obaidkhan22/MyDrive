import { ObjectId } from 'mongodb'

export const checkAuth = async (req, res, next) => {
   const { uid } = req.cookies
   if (!uid) {
      return res.status(401).json({ message: "Not logged in!" })
   }
   const db = req.db
   const user = await db.collection("users").findOne({ _id: new ObjectId(uid) })
   if (!user) {
      return res.status(401).json({ message: "Not logged in!" })
   }
   req.user = user
   next()
}