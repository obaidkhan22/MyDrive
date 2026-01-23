import express from "express";
import { readdir, rm,rename } from "fs/promises";

const app = express();
app.use(express.json())
// Enabling CORS
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "*");
  res.set("Access-Control-Allow-Headers", "*");
  next();
});


app.get('/:filename', (req,res)=> {
  const {filename} = req.params;
  if(req.query.action ==="download") {
    res.set("Content-Disposition", "Attachment")
  }
  res.sendFile(`${import.meta.dirname}/storage/${filename}`)
})

app.delete("/:filename",async(req,res)=> {
  try {
    await rm(`./storage/${req.params.filename}`);
    res.json({message: "File Deleted Successfully."});
    
  } catch (error) {
    res.status(404).json({message: "File not found."})
  }
})

app.patch("/:filename",async (req,res)=> { 
  const {filename} = req.params
  const{newFilename}= req.body
  await rename(
    `./storage/${filename}`,
    `./storage/${newFilename}`
  );
  res.end("File renamed");
})





// Serving Dir Content
app.get("/", async (req, res) => {
  const filesList = await readdir("./storage");
  res.json(filesList);
});

app.listen(4000, () => {
  console.log(`Server Started`);
});