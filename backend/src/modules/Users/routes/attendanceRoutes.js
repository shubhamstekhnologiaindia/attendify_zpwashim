import express from "express";
import { handleAttendance } from "../controllers/attendanceController.js";

import {authMiddleware} from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/record",authMiddleware, handleAttendance);

export default router; // ✅ Use default export

