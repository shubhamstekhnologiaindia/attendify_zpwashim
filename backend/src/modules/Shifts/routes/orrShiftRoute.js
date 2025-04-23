
import express from "express";
import  { OverrideShiftController}  from "../controllers/orrShiftController.js";

const router = express.Router();

router.post("/Create_OrrShift", OverrideShiftController.createOrrShift);

router.put("/Edit_OrrShift/:edit_orrshift_id", OverrideShiftController.editOrrShift);

router.get("/get_OrrShift", OverrideShiftController.getOrrShifts);

router.delete("/Delete_OrrShift/", OverrideShiftController.deleteOrrShift);

export default router;