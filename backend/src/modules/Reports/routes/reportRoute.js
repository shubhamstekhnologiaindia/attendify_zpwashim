import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import {AttendanceReports} from "../controllers/reportController.js";

const router = express.Router();


router.get("/Get_Reports_For_Day", AttendanceReports.getAttendanceReportForDay);

router.get("/Get_Reports_For_Week", AttendanceReports.getAttendanceReportForWeek)




export default router;


