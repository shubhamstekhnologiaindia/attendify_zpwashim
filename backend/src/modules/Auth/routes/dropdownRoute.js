import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";
import {MasterDropdown} from "../controllers/masterDropdownController.js";
const router = express.Router();


router.get("/show/departments",MasterDropdown.getDepartments);
router.get("/office-locations/:departmentId", MasterDropdown.getOfficeLocationsByDepartmentId);
router.get("/show-cadres/:officeLocationId",MasterDropdown.getCadresByOfficeLocationId);
router.get('/show/talukas', MasterDropdown.getTalukas);
router.get("/show/villages/:talukaId",  MasterDropdown.getVillagesByTalukaId);


router.get("/Get_Caders_By_DeptId/:deptId",  MasterDropdown.getCadresByDeptId);

export default router;
