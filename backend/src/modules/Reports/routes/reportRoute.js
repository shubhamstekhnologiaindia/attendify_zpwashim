import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import {AttendanceReports} from "../controllers/reportController.js";

const router = express.Router();


router.get("/Get_Reports_For_Day", AttendanceReports.getAttendanceReportForDay);
router.get("/Get_Reports_For_Week", AttendanceReports.getAttendanceReportForWeek)

router.get('/get-reports-for-month', AttendanceReports.getAttendanceReportForMonth);

// router.get("/Get_Reports_For_Day/", AttendanceReports.getAttendanceReportForDay);
router.get("/Get_Reports_For_Year/", AttendanceReports.getAttendanceReportForYear);
router.get("/Get_Reports_For_Month", AttendanceReports.getAttendanceReportForMonth);
router.get("/Get_Reports_Mob_no", AttendanceReports.getAttendanceReportMobno);

router.get("/Get_Reports_For_Day_SecondScreen", AttendanceReports.GetAttReportForDaySecondScreen);
router.get("/Get_Reports_For_Week_SecondScreen", AttendanceReports.GetAttReportForWeekSecondScreen);

router.get('/Get_Reports_For_Year_SecondScreen', AttendanceReports.GetAttendanceReportForYearSecondScreen);



router.get('/Get_Reports_For_Week_ThirdScreen', AttendanceReports.GetAttendanceReportForWeekThirdScreen);

router.get("/Get_Reports_For_Month_SecondScreen", AttendanceReports.GetAttReportFormonthSecondScreen)

export default router;


