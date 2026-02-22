import express from "express";

import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import {
  addDir,
  deleteDirectory,
  getDirectory,
  updateDirName,
} from "../controllers/directoryController.js";

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);
router.get("/:id?", getDirectory);
router.post("/:parentDirId?", addDir);
router.patch("/:id", updateDirName);
router.delete("/:id", deleteDirectory);

export default router;
