const express = require("express");
const router = express.Router();
const { sendBirthdayNotification } = require("./notification.controller");

router.post("/send-birthday-notification", sendBirthdayNotification);

module.exports = router;
