import express from "express";
import  { shiftController}  from "../controllers/shiftController.js";
import { authMiddleware } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/Create_Shift",authMiddleware, shiftController.createShift);

router.put("/Edit_Shift/:edit_shift_id",authMiddleware, shiftController.editShift);

router.get("/get_Shift",authMiddleware, shiftController.getShifts);

router.delete("/Delete_Shift/:delete_shift_id",authMiddleware, shiftController.deleteShift);

export default router

