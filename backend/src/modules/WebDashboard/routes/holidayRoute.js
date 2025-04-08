import express from "express";
import { HolidayController } from "../controllers/holidayController.js";
import { authMiddleware } from "../../../Middleware/authMiddleware.js";
const router = express.Router();

router.get("/upcomming-holiday",authMiddleware, HolidayController.showHolidays); 

export default router;