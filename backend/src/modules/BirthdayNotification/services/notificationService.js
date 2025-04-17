import { sendPushNotification } from "../../../../utils/firebase.js";
import { query } from "../../../../utils/database.js";
import { decrypt } from "../../../../utils/crypto.js";

// export const getTodaysBirthdayUsers = async () => {
//   try {
//     const today = new Date();
//     const month = String(today.getMonth() + 1).padStart(2, "0");
//     const day = String(today.getDate()).padStart(2, "0");

//     const sql = `
//       SELECT first_name, last_name, fcm_token 
//       FROM users 
//       WHERE MONTH(birth_date) = ? 
//       AND DAY(birth_date) = ? 
//       AND fcm_token IS NOT NULL 
//       AND status = '1'
//     `;

//     return await query(sql, [month, day]);
//   } catch (error) {
//     console.error("❌ Error fetching birthday users:", error);
//     throw error; // Re-throw to handle in the calling function
//   }
// };

// export const sendBirthdayMessages = async () => {
//   try {
//     const users = await getTodaysBirthdayUsers();

//     if (!users || users.length === 0) {
//       console.log("ℹ️ No birthdays today.");
//       return { success: true, message: "No birthdays today." };
//     }

//     const notifications = users.map(async (user) => {
//       const firstName = decryptName(user.first_name);
//       const lastName = decryptName(user.last_name);
//       const fullName = `${firstName} ${lastName}`.trim();

//       if (!fullName) {
//         console.warn(
//           "⚠️ Could not decrypt name for user with token:",
//           user.fcm_token
//         );
//         return null;
//       }

//       const message = `Dear ${fullName}, Happy Birthday! 🎂 Have a fantastic day! 🎉`;
//       return sendPushNotification(user.fcm_token, "Happy Birthday 🎉", message);
//     });

//     // Filter out null notifications (where decryption failed)
//     const validNotifications = notifications.filter(
//       (notification) => notification !== null
//     );
//     await Promise.all(validNotifications);

//     return {
//       success: true,
//       message: `Birthday notifications sent to ${validNotifications.length} users`,
//       totalUsers: users.length,
//       sentTo: validNotifications.length,
//     };
//   } catch (error) {
//     console.error("❌ Error sending birthday messages:", error);
//     return {
//       success: false,
//       message: "Error sending birthday messages",
//       error: error.message,
//     };
//   }
// };

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
    throw error;
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
        console.warn(
          "⚠️ Could not decrypt name for user with token:",
          user.fcm_token
        );
        return null;
      }

      const message = `Dear ${fullName}, Happy Birthday from CEO Office Washim! 🎂 Have a fantastic day! 🎉`;
      return sendPushNotification(user.fcm_token, "Happy Birthday 🎉", message);
    });

    const validNotifications = notifications.filter(
      (notification) => notification !== null
    );
    await Promise.all(validNotifications);

    return {
      success: true,
      message: `Birthday notifications sent to ${validNotifications.length} users`,
      totalUsers: users.length,
      sentTo: validNotifications.length,
    };
  } catch (error) {
    console.error("❌ Error sending birthday messages:", error);
    return {
      success: false,
      message: "Error sending birthday messages",
      error: error.message,
    };
  }
};

const decryptName = (encryptedName) => {
  if (!encryptedName) return "";
  try {
    return decrypt(encryptedName);
  } catch (error) {
    console.error("Error decrypting name:", encryptedName, error);
    return ""; // Return empty string if decryption fails
  }
};



// dynamic msg share by ceo
export const getUserById = async (userId) => {
  try {
    const sql = `
      SELECT first_name, last_name, fcm_token 
      FROM users 
      WHERE id = ? 
      AND fcm_token IS NOT NULL 
      AND status = '1'
    `;

    const users = await query(sql, [userId]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error("❌ Error fetching user by ID:", error);
    throw error;
  }
};

export const sendDynamicBirthdayMessage = async (
  senderId,
  receiverId,
  customMessage
) => {
  try {
    const user = await getUserById(receiverId);

    if (!user) {
      return {
        success: false,
        message: "Receiver not found or inactive",
      };
    }

    const sender = await getUserById(senderId);
    if (!sender) {
      return {
        success: false,
        message: "Sender not found or inactive",
      };
    }

    const receiverFirstName = decryptName(user.first_name);
    const receiverLastName = decryptName(user.last_name);
    const receiverFullName = `${receiverFirstName} ${receiverLastName}`.trim();

    if (!receiverFullName) {
      return {
        success: false,
        message: "Could not decrypt receiver name",
        fcmToken: user.fcm_token,
      };
    }

    const senderFirstName = decryptName(sender.first_name);
    const senderLastName = decryptName(sender.last_name);
    const senderFullName = `${senderFirstName} ${senderLastName}`.trim();

    if (!senderFullName) {
      return {
        success: false,
        message: "Could not decrypt sender name",
      };
    }

    const message = customMessage
      ? customMessage
          .replace("{name}", receiverFullName)
          .replace("{senderName}", senderFullName)
      : `Dear ${receiverFullName}, Happy Birthday from ${senderFullName}! 🎂 Have a fantastic day! 🎉`;

    const notificationResult = await sendPushNotification(
      user.fcm_token,
      "Happy Birthday 🎉",
      message
    );

    if (!notificationResult.success) {
      return {
        success: false,
        message: "Failed to send notification",
        error: notificationResult.error,
      };
    }

    // Save the message to the birthday_messages table
    const saveMessageSql = `
      INSERT INTO birthday_messages (sender_id, receiver_id, message)
      VALUES (?, ?, ?)
    `;
    await query(saveMessageSql, [senderId, receiverId, message]);

    return {
      success: true,
      // message: `Birthday notification sent to ${receiverFullName}`,
      senderName: senderFullName,
      // receiverId: receiverId,
      sentMessage: message,
      // recipientName: receiverFullName
    };
  } catch (error) {
    console.error("❌ Error sending dynamic birthday message:", error);
    return {
      success: false,
      message: "Error sending dynamic birthday message",
      error: error.message,
    };
  }
};
// show birthday msg
export const getBirthdayMessages = async (receiverId) => {
  try {
    // Query birthday_messages table for messages with the given receiver_id
    const messagesSql = `
      SELECT bm.id, bm.sender_id, bm.message, bm.created_at, u.first_name, u.last_name
      FROM birthday_messages bm
      JOIN users u ON bm.sender_id = u.id
      WHERE bm.receiver_id = ?
      ORDER BY bm.created_at DESC
    `;
    const messages = await query(messagesSql, [receiverId]);

    if (!messages || messages.length === 0) {
      return {
        success: true,
        message: "No birthday messages found for this receiver",
        messages: [],
      };
    }

    // Decrypt sender names for each message
    const formattedMessages = messages.map((msg) => {
      const senderFirstName = decryptName(msg.first_name);
      const senderLastName = decryptName(msg.last_name);
      const senderFullName = `${senderFirstName} ${senderLastName}`.trim();

      return {
        // id: msg.id,
        senderId: msg.sender_id,
        senderName: senderFullName || "Unknown Sender",
        message: msg.message,
        // createdAt: msg.created_at
      };
    });

    return {
      success: true,
      data: formattedMessages,
    };
  } catch (error) {
    console.error("❌ Error fetching birthday messages:", error);
    return {
      success: false,
      message: "Error fetching birthday messages",
      error: error.message,
    };
  }
};
