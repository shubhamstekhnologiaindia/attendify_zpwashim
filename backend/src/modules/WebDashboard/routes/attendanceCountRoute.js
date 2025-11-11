import express from "express";
import { AttendanceCountController } from "../controllers/attendanceCountController.js";
import { authMiddleware } from "../../../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/total-hq-user-counts", authMiddleware,AttendanceCountController.getUserHQCounts);
router.get("/total-district-user-counts",authMiddleware, AttendanceCountController.getUserDistrictCounts);


router.get("/total-hq-user-counts-by-department", authMiddleware, AttendanceCountController.getHQCountsByDepartment);
router.get("/total-ps-user-counts-by-department", authMiddleware, AttendanceCountController.getDistrictCountsByDepartment);

router.get("/Get_User_List_HQ",authMiddleware,AttendanceCountController.getUserAttendanceListHQ)
router.get("/Get_User_List_PS",authMiddleware,AttendanceCountController.getUserAttendanceListDistrict)
router.get("/Get_User_List_Grampanchayat",AttendanceCountController.getUserAttendanceListGP)


router.get("/Get_User_List_HQ_By_Department",authMiddleware,AttendanceCountController.getUserListHQByDepartment)
router.get("/Get_User_List_PS_By_Department",authMiddleware,AttendanceCountController.getUserListDistrictByDepartment)

router.get("/Get_User_Specific_Date_Attendance_By_Department",AttendanceCountController.getUserAttendanceByDepartment)

export default router;