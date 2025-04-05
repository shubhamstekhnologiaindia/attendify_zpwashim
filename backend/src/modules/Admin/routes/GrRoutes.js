import express from "express";
<<<<<<< HEAD
import { GRController } from "../controllers/GrController.js";
// import {authMiddleware} from "../../../middleware/authMiddleware.js";
=======
import { GRController } from "../controller/GrController.js";
>>>>>>> 8811d33d3fc27322bbd7847ebbd87eb065881afe
import upload from "../../../middleware/multer.js";

const router = express.Router();

router.post("/store", upload.single("file_upload"), GRController.storeGR);
router.put("/edit", upload.single("file_upload") ,GRController.editGR);
router.delete("/delete/:gr_id" ,GRController.deleteGR);
router.get("/gr/:dept_id?", GRController.getGRByDepartment);




export default router;
