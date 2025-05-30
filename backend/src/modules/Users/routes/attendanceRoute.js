import express from "express";
import { AttendanceController } from "../controllers/attendanceController.js";


import {authMiddleware} from "../../../middleware/authMiddleware.js";

const router = express.Router();


router.post("/Mark_Attendance",authMiddleware, AttendanceController.recordAttendance);

// router.post("/record",authMiddleware, AttendanceController.recordAttendance)

router.get("/Fetch_Attendance/:employee_id",authMiddleware, AttendanceController.getUserAttendance);

router.post("/Mark_Offline_Attendance",authMiddleware,AttendanceController.recordOfflineAttendance);

export default router; 
