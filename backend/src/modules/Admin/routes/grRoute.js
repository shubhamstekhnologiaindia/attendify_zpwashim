import express from "express";
import { GRController } from "../controllers/grController.js";
import {authMiddleware} from "../../../middleware/authMiddleware.js";
import multer from "multer";

import os from 'os';
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/Upload_GR",authMiddleware, upload.single("file_upload"),GRController.uploadGrToAzure);
router.put("/updateGR",authMiddleware, upload.single("file_upload"),GRController.updateGR);
router.delete("/deleteGR/:gr_id",authMiddleware,GRController.deleteGR);
router.get("/getGRByDepartment/:dept_id?",authMiddleware,GRController.getGRByDepartment);


export default router;
 