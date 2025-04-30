import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import {MasterData} from "../controllers/masterDataController.js";
const router = express.Router();


router.get("/show/departments",authMiddleware,MasterData.getDepartments);
router.get("/show-cadres",authMiddleware,MasterData.getCadresByOfficeLocationId);
router.get('/show/talukas', authMiddleware,MasterData.getTalukas);
router.get("/show/villages/:talukaId", authMiddleware, MasterData.getVillagesByTalukaId);
router.get("/office-locations/:departmentId",authMiddleware, MasterData.getHeadquartersZpSanstha);

router.get('/Get_Panchayat_Samiti_Locations', authMiddleware,MasterData.GetPanchayatSamitiLocations);

router.get("/Get_Caders_By_DeptId/:deptId",authMiddleware, MasterData.getCadresByDeptId);
router.get('/sanstha-locations', authMiddleware,MasterData.GetSansthaLocations);

// router.get('/Get_Office_location_By_Dept',MasterData.GetOfficeLocationByDept);


router.get('/Get_Users_For_Salary_Request', MasterData.getUsersForSalaryRequest);

export default router;
