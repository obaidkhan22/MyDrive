import express from 'express';
import { mkdir } from "fs/promises";
import path from 'path';
import directoriesData from '../directoriesDB.json' with {type:"json"}
import filesData from '../filesDB.json' with {type:"json"}

const router = express.Router()



router.get("/:id?", async (req, res) => {
  const {id} = req.params
  if(!id){
    const directoryData = directoriesData[0]
    console.log(directoryData)
   const files = directoryData.files.map((fileId) => filesData.find((file)=>fileId ===file. id))
    

    res.json({...directoryData,files})
  }else {
    const directoryData = directoriesData.find((folder)=>folder.id === id)
    res.json(directoryData)
  }
 });
 


 router.post("/?*", async(req,res)=> {
   const dirname= path.join('/',req.params[0])
 try {
   await mkdir(`../storage/${dirname}`)
   res.json({message: "Folder created successfully."})
   
 } catch (error) {
   console.log(error.message)
 }
 })

 export default router