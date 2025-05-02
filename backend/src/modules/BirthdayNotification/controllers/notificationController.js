import {
  sendBirthdayMessages,
  sendDynamicBirthdayMessage,
  getBirthdayMessages,
  sendAnnouncement,
  getUserAnnouncements,
  getCeoAnnouncementsHistory,
  
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
        return res.status(400).json({ 
          success: false, 
          message: "Sender ID and Receiver ID are required" 
        });
      }

      const response = await sendDynamicBirthdayMessage(senderId, receiverId, customMessage);
      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Error in DynamicBirthdayController:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error" 
      });
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


  // send announcement 

  // sendAnnouncement: async (req, res) => {
  //   try {
  //     const { caderId, departmentId, talukaId, sansthaId, allUsers, subject, message } = req.body;

  //     // Validate allUsers
  //     if (allUsers !== null && allUsers !== 1) {
  //       return res.status(400).json({ 
  //         success: false, 
  //         message: "allUsers must be 1 or null" 
  //       });
  //     }

  //     // Validate that at least one filter is provided if allUsers is not 1
  //     if (!allUsers && 
  //         (caderId === null || caderId === undefined) && 
  //         (departmentId === null || departmentId === undefined) && 
  //         (talukaId === null || talukaId === undefined) && 
  //         (sansthaId === null || sansthaId === undefined)) {
  //       return res.status(400).json({ 
  //         success: false, 
  //         message: "At least one of Cader ID, Department ID, Taluka ID, or Sanstha ID must be provided when allUsers is not 1" 
  //       });
  //     }

  //     // Validate caderId if provided
  //     if (caderId !== null && (!Number.isInteger(caderId) || caderId <= 0)) {
  //       return res.status(400).json({ 
  //         success: false, 
  //         message: "Cader ID must be a positive integer or null" 
  //       });
  //     }

  //     // Validate departmentId if provided
  //     if (departmentId !== null && (!Number.isInteger(departmentId) || departmentId <= 0)) {
  //       return res.status(400).json({ 
  //         success: false, 
  //         message: "Department ID must be a positive integer or null" 
  //       });
  //     }

  //     // Validate talukaId if provided
  //     if (talukaId !== null && (!Number.isInteger(talukaId) || talukaId <= 0)) {
  //       return res.status(400).json({ 
  //         success: false, 
  //         message: "Taluka ID must be a positive integer or null" 
  //       });
  //     }

  //     // Validate sansthaId if provided
  //     if (sansthaId !== null && (!Number.isInteger(sansthaId) || sansthaId <= 0)) {
  //       return res.status(400).json({ 
  //         success: false, 
  //         message: "Sanstha ID must be a positive integer or null" 
  //       });
  //     }

  //     // Validate subject and message
  //     if (!subject || !message) {
  //       return res.status(400).json({ 
  //         success: false, 
  //         message: "Subject and message are required" 
  //       });
  //     }

  //     const response = await sendAnnouncement(caderId, departmentId, talukaId, sansthaId, allUsers, subject, message);
  //     res.status(200).json(response);
  //   } catch (error) {
  //     console.error("❌ Error in SendAnnouncementController:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // },


  sendAnnouncement: async (req, res) => {
    try {
      const { senderUserId, caderId, departmentId, talukaId, sansthaId, allUsers, subject, message } = req.body;

      if (!senderUserId || !Number.isInteger(senderUserId) || senderUserId <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Sender User ID must be a positive integer" 
        });
      }

      if (allUsers !== null && allUsers !== 1) {
        return res.status(400).json({ 
          success: false, 
          message: "allUsers must be 1 or null" 
        });
      }

      if (!allUsers && 
          (caderId === null || caderId === undefined) && 
          (departmentId === null || departmentId === undefined) && 
          (talukaId === null || talukaId === undefined) && 
          (sansthaId === null || sansthaId === undefined)) {
        return res.status(400).json({ 
          success: false, 
          message: "At least one of Cader ID, Department ID, Taluka ID, or Sanstha ID must be provided when allUsers is not 1" 
        });
      }

      if (caderId !== null && (!Number.isInteger(caderId) || caderId <= 0)) {
        return res.status(400).json({ 
          success: false, 
          message: "Cader ID must be a positive integer or null" 
        });
      }

      if (departmentId !== null && (!Number.isInteger(departmentId) || departmentId <= 0)) {
        return res.status(400).json({ 
          success: false, 
          message: "Department ID must be a positive integer or null" 
        });
      }

      if (talukaId !== null && (!Number.isInteger(talukaId) || talukaId <= 0)) {
        return res.status(400).json({ 
          success: false, 
          message: "Taluka ID must be a positive integer or null" 
        });
      }

      if (sansthaId !== null && (!Number.isInteger(sansthaId) || sansthaId <= 0)) {
        return res.status(400).json({ 
          success: false, 
          message: "Sanstha ID must be a positive integer or null" 
        });
      }

      if (!subject || !message) {
        return res.status(400).json({ 
          success: false, 
          message: "Subject and message are required" 
        });
      }

      const response = await sendAnnouncement(senderUserId, caderId, departmentId, talukaId, sansthaId, allUsers, subject, message);
      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Error in SendAnnouncementController:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getUserAnnouncements: async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: "User ID must be a positive integer" 
        });
      }

      const response = await getUserAnnouncements(Number(userId));
      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Error in GetUserAnnouncementsController:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },



  getCeoAnnouncementsHistory: async (req, res) => {
   
    try {
      const { user_id } = req.params;

      // Validate user_id
      if (!user_id || isNaN(user_id)) {
          return res.status(400).json({
              success: false,
              message: 'Valid user_id is required'
          });
      }

      const announcements = await getCeoAnnouncementsHistory(parseInt(user_id));
      res.status(200).json({
          success: true,
          message: announcements.length ? 'Announcements retrieved successfully' : 'No announcements found',
          data: announcements
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Internal server error',
          details: error.message
      });
  }
},
 
};
