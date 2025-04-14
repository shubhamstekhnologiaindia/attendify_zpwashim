import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import {AttendanceReports} from "../controllers/reportController.js";

const router = express.Router();


router.get("/Get_Reports_For_Day", AttendanceReports.getAttendanceReportForDay);

router.get("/Get_Reports_For_Week", AttendanceReports.getAttendanceReportForWeek)


// router.get("/Get_Reports_For_Day/", AttendanceReports.getAttendanceReportForDay);
router.get("/Get_Reports_For_Year/", AttendanceReports.getAttendanceReportForYear);
router.get("/Get_Reports_For_Month", AttendanceReports.getAttendanceReportForMonth);

router.get("/mob_no_reports", AttendanceReports.getAttendanceForUser);
router.get("/Get_Reports_For_Day_SecondScreen", AttendanceReports.GetAttReportForDaySecondScreen);

router.get("/Get_Reports_For_Week_SecondScreen", AttendanceReports.GetAttReportForWeekSecondScreen);


export default router;


