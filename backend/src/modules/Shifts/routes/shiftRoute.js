import express from "express";
import  { shiftController}  from "../controllers/shiftController.js";

const router = express.Router();


router.post("/Create_Shift", shiftController.createShift);

router.put("/Edit_Shift/:edit_shift_id", shiftController.editShift);

router.get("/get_Shift", shiftController.getShifts);

router.delete("/Delete_Shift/:delete_shift_id", shiftController.deleteShift);



export default router;
