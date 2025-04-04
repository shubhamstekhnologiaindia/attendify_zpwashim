import { sendBirthdayMessages  } from '../services/notification.service.js';
import { query } from "../../../../utils/database.js"; 

export const BirthdayController = {
  sendBirthdayNotification: async (req, res) => {
    try {
      const response = await sendBirthdayMessages();
      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Error in BirthdayController:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};