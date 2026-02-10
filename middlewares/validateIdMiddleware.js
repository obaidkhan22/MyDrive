export default function validateIdMiddleware(req, res, next, id) {


   if (id.length !== 24) {
      return res.status(400).json({ message: "Invalid ID." })
   }
   next()
}