import express from "express";
import { AttendanceController } from "../controllers/attendanceController.js";


import {authMiddleware} from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/record",authMiddleware, AttendanceController.recordAttendance);
router.get("/calculate-attendance", AttendanceController.CalculateAttendanceHours);

export default router; 
