import express from "express";
import { GRController } from "../controller/GrController.js";
import {authMiddleware} from "../../../middleware/authMiddleware.js";
import upload from "../../../middleware/multer.js";

const router = express.Router();

router.post("/store", upload.single("file_upload"),authMiddleware, GRController.storeGR);

router.get("/get/:dept_id",authMiddleware, GRController.getGRByDepartment); // Get GR by department

export default router;
