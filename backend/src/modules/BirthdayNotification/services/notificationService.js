import { sendPushNotification } from "../../../../utils/firebase.js";
import { query } from "../../../../utils/database.js"; 
import { decrypt } from "../../../../utils/crypto.js";

export const getTodaysBirthdayUsers = async () => {
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const sql = `
      SELECT first_name, last_name, fcm_token 
      FROM users 
      WHERE MONTH(birth_date) = ? 
      AND DAY(birth_date) = ? 
      AND fcm_token IS NOT NULL 
      AND status = '1'
    `;
    
    return await query(sql, [month, day]);
  } catch (error) {
    console.error("❌ Error fetching birthday users:", error);
    throw error; // Re-throw to handle in the calling function
  }
};

const decryptName = (encryptedName) => {
  if (!encryptedName) return '';
  try {
    return decrypt(encryptedName);
  } catch (error) {
    console.error("Error decrypting name:", encryptedName, error);
    return ''; // Return empty string if decryption fails
  }
};

export const sendBirthdayMessages = async () => {
  try {
    const users = await getTodaysBirthdayUsers();

    if (!users || users.length === 0) {
      console.log("ℹ️ No birthdays today.");
      return { success: true, message: "No birthdays today." };
    }

    const notifications = users.map(async (user) => {
      const firstName = decryptName(user.first_name);
      const lastName = decryptName(user.last_name);
      const fullName = `${firstName} ${lastName}`.trim();

      if (!fullName) {
        console.warn("⚠️ Could not decrypt name for user with token:", user.fcm_token);
        return null;
      }

      const message = `Dear ${fullName}, Happy Birthday! 🎂 Have a fantastic day! 🎉`;
      return sendPushNotification(user.fcm_token, "Happy Birthday 🎉", message);
    });

    // Filter out null notifications (where decryption failed)
    const validNotifications = notifications.filter(notification => notification !== null);
    await Promise.all(validNotifications);

    return { 
      success: true, 
      message: `Birthday notifications sent to ${validNotifications.length} users`,
      totalUsers: users.length,
      sentTo: validNotifications.length
    };
  } catch (error) {
    console.error("❌ Error sending birthday messages:", error);
    return { 
      success: false, 
      message: "Error sending birthday messages",
      error: error.message 
    };
  }
};