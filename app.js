import cors from "cors";
import express from "express";
import fileRoutes from './routes/fileRoutes.js'
import directoryRoutes from './routes/directoryRoutes.js'
const app = express();

app.use(express.json());
app.use(cors());
app.use('/file', fileRoutes)
app.use('/directory', directoryRoutes)


app.listen(4000, () => {
  console.log(`Server Started`);
});
