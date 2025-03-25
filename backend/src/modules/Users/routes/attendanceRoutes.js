import express from "express";
import { markAttendance } from "../controllers/attendanceController.js";

import {authMiddleware} from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/record",authMiddleware, markAttendance);

export default router; 
