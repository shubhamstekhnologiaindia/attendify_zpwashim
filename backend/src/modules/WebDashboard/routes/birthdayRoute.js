import express from "express";
import { BirthdayController } from "../controllers/birthdayController.js";
import { authMiddleware } from "../../../Middleware/authMiddleware.js";
const router = express.Router();

// router.get("/todays-birthdays",  BirthdayController.showTodaysBirthdays);
router.get("/todays-birthdays",authMiddleware,  BirthdayController.showTodaysBirthdays);

export default router;
