import express from "express";
import  { hodController}  from "../controllers/hodController.js";

const router = express.Router();

router.get("/hod/employees/:hod_id", hodController.getEmployeesByHodController);
// router.post("/employees/status/:hod_id", hodController.updateEmployeeStatus);
router.post("/employees/status/:hod_id", hodController.updateEmployeeStatus);


router.get('/showusers/hod/field', hodController.getUsersByHodDept);

router.post('/update-field-status', hodController.updateFieldStatus);
export default router;
