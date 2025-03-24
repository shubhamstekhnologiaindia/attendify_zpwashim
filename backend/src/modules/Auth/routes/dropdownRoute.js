import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";
import {MasterDropdown} from "../controllers/masterDropdownController.js";
const router = express.Router();


router.get("/show/departments", authMiddleware,MasterDropdown.getDepartments);
router.get('/show/talukas',authMiddleware, MasterDropdown.getTalukas);
router.get("/show/villages/:talukaId", authMiddleware, MasterDropdown.getVillagesByTalukaId);

export default router;
