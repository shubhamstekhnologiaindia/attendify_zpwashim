import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";
import { sendPushNotification } from "../../../../utils/firebase.js";
import { query } from "../../../../utils/database.js";

import { BirthdayController  } from "../controllers/notificationController.js";
const router = express.Router();

router.post("/send-birthday-notifications",authMiddleware, BirthdayController.sendBirthdayNotification);
router.post("/send-dynamic-birthday-notification", authMiddleware,BirthdayController.sendDynamicBirthdayNotification);
router.post("/get-birthday-messages",authMiddleware, BirthdayController.getBirthdayMessages);
router.post("/send-announcement",authMiddleware, BirthdayController.sendAnnouncement);
// router.post("/send-announcement", BirthdayController.sendAnnouncement);
router.get("/get-department-announcements",authMiddleware, BirthdayController.getUserAnnouncements);

router.get('/ceo-announcements-history/:user_id', authMiddleware,BirthdayController.getCeoAnnouncementsHistory);





router.post('/send-test-notification', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  try {
    // Fetch user with fcm_token
    const users = await query('SELECT id, fcm_token FROM users WHERE id = ? AND status = 1 AND fcm_token IS NOT NULL', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found or no valid FCM token' });
    }

    const { fcm_token } = users[0];
    const title = 'Test Notification';
    const message = 'Please Mark Attendance';

    const result = await sendPushNotification(fcm_token, title, message);

    if (result.success) {
      res.status(200).json({ success: true, message: `Notification sent to user ${userId}` });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send notification', error: result.error });
    }
  } catch (error) {
    console.error('❌ Error in send-test-notification:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});
export default router; 