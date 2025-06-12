import express from "express";
import { HolidayController } from "../controllers/holidayController.js";
import { authMiddleware } from "../../../Middleware/authMiddleware.js";
const router = express.Router();

router.get("/upcomming-holiday", authMiddleware,HolidayController.showHolidays); 

router.put('/update_radius',authMiddleware ,HolidayController.updateRadius);
router.get('/show_radius',authMiddleware,HolidayController.getRadiusWeb);



router.post('/Create_Holidays', HolidayController.createHoliday);   // create
router.get('/Show_All_Holidays', HolidayController.showHolidaysList);
router.put('/Update_Holidays', HolidayController.updateHoliday); // update
router.delete('/Delete_Holidays', HolidayController.deleteHoliday); 
export default router;