import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import { BirthdayController  } from "../controllers/notificationController.js";
const router = express.Router();

router.post("/send-birthday-notifications",authMiddleware, BirthdayController.sendBirthdayNotification);
router.post("/send-dynamic-birthday-notification", authMiddleware,BirthdayController.sendDynamicBirthdayNotification);
router.post("/get-birthday-messages",authMiddleware, BirthdayController.getBirthdayMessages);
router.post("/send-announcement",authMiddleware, BirthdayController.sendAnnouncement);
// router.post("/send-announcement", BirthdayController.sendAnnouncement);
router.get("/get-department-announcements",authMiddleware, BirthdayController.getUserAnnouncements);

router.get('/ceo-announcements-history/:user_id', authMiddleware,BirthdayController.getCeoAnnouncementsHistory);

export default router; 