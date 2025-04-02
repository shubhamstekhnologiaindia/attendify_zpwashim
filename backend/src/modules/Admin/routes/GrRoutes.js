import express from "express";
import { GRController } from "../controllers/GrController.js";
// import {authMiddleware} from "../../../middleware/authMiddleware.js";
import upload from "../../../middleware/multer.js";

const router = express.Router();

router.post("/store", upload.single("file_upload"), GRController.storeGR);
router.put("/edit", upload.single("file_upload") ,GRController.editGR);
router.get("/get/:dept_id", GRController.getGRByDepartment); 
router.delete("/delete/:gr_id" ,GRController.deleteGR);


export default router;
