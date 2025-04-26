import express from "express";
import { AttendanceCountController } from "../controllers/attendanceCountController.js";
import { authMiddleware } from "../../../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/total-hq-user-counts", authMiddleware,AttendanceCountController.getUserHQCounts);
router.get("/total-district-user-counts",authMiddleware, AttendanceCountController.getUserDistrictCounts);

export default router;