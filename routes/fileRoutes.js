import express from 'express'
import { createWriteStream } from "fs";
import { rename, rm, writeFile } from "fs/promises";
import path from 'path';
import filesData from '../filesDB.json' with {type:"json"}
import directoriesData from '../directoriesDB.json' with {type:"json"}

const router = express.Router()
// Create
router.post("/:filename", (req, res) => {
   const extension = path.extname(req.params.filename)
   const parentDirId = req.headers.parentdir || directoriesData[0].id
   const id = crypto.randomUUID()
   const fullName = id+extension
   const writeStream = createWriteStream(`./storage/${fullName}`);
   req.pipe(writeStream);
   req.on("end", async () => {
      filesData.push({
         id,
         extension,
         name:req.params.filename,
         parentDirId
      })
      const fileDir = directoriesData.find((dir)=>dir.id === parentDirId)
      fileDir.files.push(id)

      await writeFile('./filesDB.json',JSON.stringify(filesData))
      await writeFile('./directoriesDB.json',JSON.stringify(directoriesData))
     res.json({ message: "File Uploaded" });
   });
 });
 
 //Read
 router.get("/:id", (req, res) => {
   const {id} = req.params;
   console.log(id)
   const fileData = filesData.find((file)=>file.id ===id)
   if (req.query.action === "download") {
     res.set("Content-Disposition", "attachment");
   }
   res.sendFile(`${process.cwd()}/storage/${id}${fileData.extension}`,(err)=> {
     if(err){
       res.json({error:"File not found!"})
     }
   });
 });
 
 // Update
 router.patch("/:id", async (req, res) => {
  const {id} = req.params
  const {filename} = req.body
  const file = filesData.find((file)=>file.id ===id)
  file.name = filename
  await writeFile('./filesDB.json', JSON.stringify(filesData))
   res.json({ message: "Renamed" });
 });
 // Delete
 router.delete("/:id", async (req, res) => {
   try {
     const {id} = req.params
     const fileIndex = filesData.findIndex((file)=>file.id ===id)
     const fileData = filesData[fileIndex]
     const fullName = id + fileData.extension
     await rm(`./storage/${fullName}`, { recursive: true });
     filesData.splice(fileIndex,1)
     const parentDir = directoriesData.find((dir)=>dir.id ===fileData.parentDirId)
     parentDir.files.filter((file)=>file.id !==id)
     await writeFile('./filesDB.json', JSON.stringify(fileData))
     await writeFile('./directoriesDB.json', JSON.stringify(directoriesData))
     res.json({ message: "File Deleted Successfully" });
   } catch (err) {
     res.status(404).json({ message: err.message });
   }
 });

 export default router