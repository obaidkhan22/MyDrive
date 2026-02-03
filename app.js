import cors from "cors";
import express from "express";
import fileRoutes from './routes/fileRoutes.js'
import directoryRoutes from './routes/directoryRoutes.js'
import userRoutes from './routes/userRoutes.js'
const app = express();

app.use(express.json());
app.use(cors());
app.use('/file', fileRoutes)
app.use('/directory', directoryRoutes)
app.use('/user', userRoutes)

app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({ message: "Something went wrong." })
})

app.listen(4000, () => {
  console.log(`Server Started`);
});
