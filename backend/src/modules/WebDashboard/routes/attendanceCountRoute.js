import express from "express";
import { AttendanceCountController } from "../controllers/attendanceCountController.js";

const router = express.Router();

router.get("/total-hq-user-counts", AttendanceCountController.getUserHQCounts);
router.get("/total-district-user-counts", AttendanceCountController.getUserDistrictCounts);

export default router;