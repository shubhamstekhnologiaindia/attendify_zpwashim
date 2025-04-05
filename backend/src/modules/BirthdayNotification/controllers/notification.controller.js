import { sendBirthdayMessages  } from '../services/notification.service.js';
import { query } from "../../../../utils/database.js"; 

<<<<<<< HEAD
// export const BirthdayController = {
//   sendBirthdayNotification: async (req, res) => {
//     try {
//       const response = await sendBirthdayMessages();
//       res.status(200).json(response);
//     } catch (error) {
//       console.error("❌ Error in BirthdayController:", error);
//       res.status(500).json({ success: false, message: "Server error" });
//     }
//   },
// };

=======
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
>>>>>>> 8811d33d3fc27322bbd7847ebbd87eb065881afe
