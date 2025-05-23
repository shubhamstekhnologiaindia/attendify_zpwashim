import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import {AttendanceReports} from "../controllers/reportController.js";

const router = express.Router();


router.get("/Get_Reports_For_Day",authMiddleware, AttendanceReports.getAttendanceReportForDay);
router.get("/Get_Reports_For_Week",authMiddleware, AttendanceReports.getAttendanceReportForWeek)

// router.get('/get-reports-for-month', AttendanceReports.getAttendanceReportForMonth);

// router.get("/Get_Reports_For_Day/", AttendanceReports.getAttendanceReportForDay);
router.get("/Get_Reports_For_Year/",authMiddleware, AttendanceReports.getAttendanceReportForYear);
router.get("/Get_Reports_For_Month_SecondScreen",authMiddleware, AttendanceReports.GetAttReportFormonthSecondScreen);
 
router.get("/Get_Reports_For_Month",authMiddleware, AttendanceReports.getAttendanceReportForMonth);
router.get("/Get_Reports_Mob_no",authMiddleware, AttendanceReports.getAttendanceReportMobno);

router.get("/Get_Reports_For_Day_SecondScreen",authMiddleware, AttendanceReports.GetAttReportForDaySecondScreen);
router.get("/Get_Reports_For_Week_SecondScreen",authMiddleware, AttendanceReports.GetAttReportForWeekSecondScreen);

router.get('/Get_Reports_For_Year_SecondScreen',authMiddleware, AttendanceReports.GetAttendanceReportForYearSecondScreen);

router.get('/Get_Reports_For_Week_ThirdScreen',authMiddleware, AttendanceReports.GetAttendanceReportForWeekThirdScreen);
router.get('/Get_Reports_For_Emp_Deatils_By_Date',authMiddleware, AttendanceReports.GetAttendanceReportForWeekDateForthScreen);
router.get('/Get_Reports_For_Emp_Deatils_By_Year',authMiddleware, AttendanceReports.GetAttendanceReportForYearForthScreen);
router.get('/Get_Reports_For_CadersName',authMiddleware, AttendanceReports.GetAttendanceReportForDayThirdScreen);

router.get('/Get_Reports_For_All_Sanstha_For_Day',authMiddleware, AttendanceReports.GetAttendanceReportForDayForSanstha);

router.get('/Get_Reports_For_Year_ThirdScreen',authMiddleware,AttendanceReports.GetAttendanceReportForWeekThirdScreen);

router.get('/Get_Reports_For_Week_Sanstha',authMiddleware,AttendanceReports.GetWeeklyAttendanceBySanstha);

router.get("/Get_Reports_For_Week_Cader_Wise",authMiddleware, AttendanceReports.GetWeeklyAttendanceByCader);
router.get('/Get_Reports_For_Month_Location_Wise_Cader',authMiddleware, AttendanceReports.GetMonthlyAttendanceByCader);



router.post("/attendance/history/by-user", AttendanceReports.listAttendanceByUser);
export default router;


