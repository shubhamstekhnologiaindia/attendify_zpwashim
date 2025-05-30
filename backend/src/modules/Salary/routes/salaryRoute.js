import express from "express";
import {authMiddleware} from "../../../middleware/authMiddleware.js";
import multer from 'multer';
import {SalaryController} from "../controllers/salaryController.js";

const router = express.Router();

router.post('/Save_Users_For_Salary_Slip_Permission',authMiddleware,SalaryController.saveSalarySlipPermission);
router.put('/Update_Users_For_Salary_Slip_Permission', authMiddleware,SalaryController.updateSalarySlipPermission);
router.delete('/Delete_Users_For_Salary_Slip_Permission/:salary_slip_per_id', authMiddleware,SalaryController.deleteSalarySlipPermission);

router.get('/checking_salary_slip_per', authMiddleware,SalaryController.checking_salary_slip_per);

router.post('/salary-slips-store', authMiddleware,SalaryController.storeSalarySlipRequest);
router.get('/salary-slip-permitters', authMiddleware,SalaryController.listSalarySlipPermissions);


const upload = multer({ storage: multer.memoryStorage() });
router.post('/Upload_Salary_Slip', authMiddleware,upload.any(), SalaryController.uploadSalarySlipToAzure);

router.get('/FetchUsersForSalarySlip', authMiddleware,SalaryController.getSalarySlips);

router.post('/salary-slips-request-history', authMiddleware,SalaryController.listSalarySlipsBySender);
router.get('/Salary-Heads',authMiddleware,SalaryController.getListOfSalaryHeads);

router.put('/salary-slip/request-reject', authMiddleware,SalaryController.rejectSalarySlipRequest);

export default router;

