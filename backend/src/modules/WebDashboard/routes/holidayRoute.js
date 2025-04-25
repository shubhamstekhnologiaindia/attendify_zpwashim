import express from "express";
import { HolidayController } from "../controllers/holidayController.js";
import { authMiddleware } from "../../../Middleware/authMiddleware.js";
const router = express.Router();

router.get("/upcomming-holiday", HolidayController.showHolidays); 

router.put('/update_radius', HolidayController.updateRadius);
router.get('/show_radius', HolidayController.getRadiusWeb);

export default router;