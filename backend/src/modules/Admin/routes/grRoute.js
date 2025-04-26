import express from "express";
import { GRController } from "../controllers/GrController.js";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";
import upload from "../../../middleware/multer.js";

const router = express.Router();

router.post("/store", upload.single("file_upload"),authMiddleware, GRController.storeGR);
router.put("/edit", upload.single("file_upload") ,authMiddleware,GRController.editGR);
router.delete("/delete/:gr_id" ,authMiddleware,GRController.deleteGR);
router.get("/gr/:dept_id?",authMiddleware, GRController.getGRByDepartment);




export default router;
