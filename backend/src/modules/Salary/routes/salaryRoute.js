import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import {SalaryController} from "../controllers/salaryController.js";

const router = express.Router();

router.post('/Save_Users_For_Salary_Slip_Permission', SalaryController.saveSalarySlipPermission);
router.put('/Update_Users_For_Salary_Slip_Permission', SalaryController.updateSalarySlipPermission);
router.delete('/Delete_Users_For_Salary_Slip_Permission/:salary_slip_per_id', SalaryController.deleteSalarySlipPermission);

router.post('/checking_salary_slip_per', SalaryController.checking_salary_slip_per);

export default router;


