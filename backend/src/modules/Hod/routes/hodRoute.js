import express from "express";
import  { hodController}  from "../controllers/hodController.js";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/hod/employees/:hod_id",authMiddleware, hodController.getEmployeesByHodController);
// router.post("/employees/status/:hod_id", hodController.updateEmployeeStatus);
router.post("/employees/status/:hod_id",authMiddleware, hodController.updateEmployeeStatus);


router.get('/showusers/hod/field',authMiddleware, hodController.getUsersByHodDept);

router.post('/update-field-status',authMiddleware, hodController.updateFieldStatus);
export default router;
