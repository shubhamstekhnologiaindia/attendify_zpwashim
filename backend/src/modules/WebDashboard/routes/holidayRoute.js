import express from "express";
import { HolidayController } from "../controllers/holidayController.js";
import { authMiddleware } from "../../../Middleware/authMiddleware.js";
const router = express.Router();

router.get("/upcomming-holiday", authMiddleware,HolidayController.showHolidays); 

router.put('/update_radius',authMiddleware ,HolidayController.updateRadius);
router.get('/show_radius',authMiddleware,HolidayController.getRadiusWeb);



router.post('/Create_Holidays', authMiddleware,HolidayController.createHoliday);   // create
router.get('/Show_All_Holidays', authMiddleware,HolidayController.showHolidaysList);
router.put('/Update_Holidays',authMiddleware, HolidayController.updateHoliday); // update
router.delete('/Delete_Holidays',authMiddleware, HolidayController.deleteHoliday); 
export default router;