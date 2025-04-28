import express from "express";
import { HolidayController } from "../controllers/holidayController.js";
import { authMiddleware } from "../../../Middleware/authMiddleware.js";
const router = express.Router();

router.get("/upcomming-holiday", authMiddleware,HolidayController.showHolidays); 

router.put('/update_radius',authMiddleware ,HolidayController.updateRadius);
router.get('/show_radius',authMiddleware,HolidayController.getRadiusWeb);

export default router;