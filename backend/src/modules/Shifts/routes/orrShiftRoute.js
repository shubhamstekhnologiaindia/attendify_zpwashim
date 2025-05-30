
import express from "express";
import  { OverrideShiftController}  from "../controllers/orrShiftController.js";
import { authMiddleware } from "../../../middleware/authMiddleware.js"

const router = express.Router();

router.post("/Create_OrrShift",authMiddleware, OverrideShiftController.createOrrShift);

router.put("/Edit_OrrShift/:edit_orrshift_id",authMiddleware, OverrideShiftController.editOrrShift);

router.get("/get_OrrShift",authMiddleware, OverrideShiftController.getOrrShifts);

router.delete("/Delete_OrrShift",authMiddleware, OverrideShiftController.deleteOrrShift);

export default router;