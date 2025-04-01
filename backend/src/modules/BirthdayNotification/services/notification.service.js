// // import { admin } from "../../../utils/firebase-admin.js";
// // import { admin } from "../../../../utils/firebase.js";
// import { sendPushNotification } from "../../../../utils/firebase.js";
// import { query } from "../../../../utils/database.js"; 
// export const getTodaysBirthdayUsers = async () => {
//   try {
//     const today = new Date();
//     const month = String(today.getMonth() + 1).padStart(2, "0");
//     const day = String(today.getDate()).padStart(2, "0");

//     // Fetch users whose birthday is today
//     const sql = `
//       SELECT first_name, last_name, fcm_token 
//       FROM users 
//       WHERE MONTH(birth_date) = ? 
//       AND DAY(birth_date) = ? 
//       AND fcm_token IS NOT NULL 
//       AND status = '1'
//     `;
    
//     const users = await query(sql, [month, day]);  // Using query function

//     return users;
//   } catch (error) {
//     console.error("❌ Error fetching birthday users:", error);
//     return [];
//   }
// };

// export const sendBirthdayMessages = async () => {
//   try {
//     const users = await getTodaysBirthdayUsers();

//     if (users.length === 0) {
//       console.log("ℹ️ No birthdays today.");
//       return { success: true, message: "No birthdays today." };
//     }

//     // Send push notification to each user
//     const notifications = users.map(async (user) => {
//       const fullName = `${user.first_name} ${user.last_name}`.trim();
//       const message = `Dear ${fullName}, Happy Birthday! 🎂 Have a fantastic day! 🎉`;

//       return sendPushNotification(user.fcm_token, "Happy Birthday 🎉", message);
//     });

//     await Promise.all(notifications);

//     return { success: true, message: `Birthday notifications sent to ${users.length} users` };
//   } catch (error) {
//     console.error("❌ Error sending birthday messages:", error);
//     return { success: false, message: "Error sending birthday messages" };
//   }
// };