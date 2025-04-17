import express from "express";

import { BirthdayController  } from "../controllers/notificationController.js";
const router = express.Router();

router.post("/send-birthday-notifications", BirthdayController.sendBirthdayNotification);
router.post("/send-dynamic-birthday-notification", BirthdayController.sendDynamicBirthdayNotification);
router.post("/get-birthday-messages", BirthdayController.getBirthdayMessages);
router.post("/send-announcement", BirthdayController.sendAnnouncement);
// router.post("/send-announcement", BirthdayController.sendAnnouncement);
router.get("/get-department-announcements", BirthdayController.getUserAnnouncements);
export default router; 