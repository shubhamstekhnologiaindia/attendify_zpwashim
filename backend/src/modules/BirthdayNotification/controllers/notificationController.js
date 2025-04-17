import {
  sendBirthdayMessages,
  sendDynamicBirthdayMessage,
  getBirthdayMessages,
} from "../services/notificationService.js";

export const BirthdayController = {
  // sendBirthdayNotification: async (req, res) => {
  //   try {
  //     const response = await sendBirthdayMessages();
  //     res.status(200).json(response);
  //   } catch (error) {
  //     console.error("❌ Error in BirthdayController:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // },
  sendBirthdayNotification: async (req, res) => {
    try {
      const response = await sendBirthdayMessages();
      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Error in BirthdayController:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  sendDynamicBirthdayNotification: async (req, res) => {
    try {
      const { senderId, receiverId, customMessage } = req.body;
      
      if (!senderId || !receiverId) {
        return res.status(400).json({ success: false, message: "Sender ID and Receiver ID are required" });
      }

      const response = await sendDynamicBirthdayMessage(senderId, receiverId, customMessage);
      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Error in DynamicBirthdayController:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getBirthdayMessages: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ success: false, message: "user Id  is required" });
      }

      const response = await getBirthdayMessages(userId);
      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Error in GetBirthdayMessagesController:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
