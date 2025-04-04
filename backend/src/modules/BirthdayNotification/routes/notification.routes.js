import express from "express";

import { BirthdayController  } from "../controllers/notification.controller.js";
const router = express.Router();

router.post("/send-birthday-notifications", BirthdayController.sendBirthdayNotification);

export default router; 