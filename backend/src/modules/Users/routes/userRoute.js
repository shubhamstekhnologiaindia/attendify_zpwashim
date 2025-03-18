import express from "express";
import authMiddleware from "../../../middleware/authMiddleware.js";
import { userController } from "../controllers/userController.js";


const router = express.Router();

// User routes
router.post("/register", userController.register);
// router.post("/login", userController.login);
// router.get("/profile", authMiddleware, userController.getProfile);

// Attendance routes
// router.post("/mark-attendance", authMiddleware, attendanceController.markAttendance);

export default router; // ✅ Ensure this line exists
