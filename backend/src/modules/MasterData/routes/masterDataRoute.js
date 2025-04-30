import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import {MasterData} from "../controllers/masterDataController.js";
const router = express.Router();


router.get("/show/departments",MasterData.getDepartments);
router.get("/show-cadres",MasterData.getCadresByOfficeLocationId);
router.get('/show/talukas',MasterData.getTalukas);
router.get("/show/villages/:talukaId", MasterData.getVillagesByTalukaId);
router.get("/office-locations/:departmentId", MasterData.getHeadquartersZpSanstha);

router.get('/Get_Panchayat_Samiti_Locations',MasterData.GetPanchayatSamitiLocations);

router.get("/Get_Caders_By_DeptId/:deptId", MasterData.getCadresByDeptId);
router.get('/sanstha-locations',MasterData.GetSansthaLocations);

// router.get('/Get_Office_location_By_Dept',MasterData.GetOfficeLocationByDept);


router.get('/Get_Users_For_Salary_Request', MasterData.getUsersForSalaryRequest);

export default router;
