import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import {AttendanceReports} from "../controllers/reportController.js";

const router = express.Router();



router.get('/get-reports-for-month', AttendanceReports.getAttendanceReportForMonth);


router.get("/Get_Reports_For_Day/", AttendanceReports.getAttendanceReportForDay);


export default router;


