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

// send birthday msg from ceo to employees
export const getUserById = async (userId) => {
  try {
    const sql = `
      SELECT first_name, last_name, fcm_token, role_id
      FROM users 
      WHERE id = ? 
      AND status = '1'
      AND (role_id = 101 OR (role_id IN (102, 103) AND fcm_token IS NOT NULL))
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
        message:
          "Receiver not found, inactive, or missing FCM token for role 103",
      };
    }

    const sender = await getUserById(senderId);
    if (!sender) {
      return {
        success: false,
        message:
          "Sender not found, inactive, or missing FCM token for role 103",
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

    // Send push notification only if fcm_token exists (role_id 103 or role_id 101 with non-null token)
    let notificationResult = { success: true };
    if (user.fcm_token) {
      console.log("Sending notification to FCM token:", user.fcm_token);
      notificationResult = await sendPushNotification(
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
    }

    // Save the message to the birthday_messages table
    const saveMessageSql = `
      INSERT INTO birthday_messages (sender_id, receiver_id, message)
      VALUES (?, ?, ?)
    `;
    await query(saveMessageSql, [senderId, receiverId, message]);

    return {
      success: true,
      senderName: senderFullName,
      sentMessage: message,
      notificationSent: !!user.fcm_token, // Indicates if a notification was sent
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
        createdAt: msg.created_at,
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

//  send announcement
export const sendAnnouncement = async (
  senderUserId,
  caderId,
  departmentId,
  talukaId,
  sansthaId,
  allUsers,
  subject,
  message
) => {
  try {
    // Validate inputs
    if (!senderUserId || !Number.isInteger(senderUserId) || senderUserId <= 0) {
      return {
        success: false,
        message: "Sender User ID must be a positive integer",
      };
    }

    if (
      !allUsers &&
      (caderId === null || caderId === undefined) &&
      (departmentId === null || departmentId === undefined) &&
      (talukaId === null || talukaId === undefined) &&
      (sansthaId === null || sansthaId === undefined)
    ) {
      return {
        success: false,
        message:
          "At least one of Cader ID, Department ID, Taluka ID, or Sanstha ID must be provided when allUsers is not 1",
      };
    }

    if (allUsers !== null && allUsers !== 1) {
      return {
        success: false,
        message: "allUsers must be 1 or null",
      };
    }

    if (caderId !== null && (!Number.isInteger(caderId) || caderId <= 0)) {
      return {
        success: false,
        message: "Cader ID must be a positive integer or null",
      };
    }

    if (
      departmentId !== null &&
      (!Number.isInteger(departmentId) || departmentId <= 0)
    ) {
      return {
        success: false,
        message: "Department ID must be a positive integer or null",
      };
    }

    if (talukaId !== null && (!Number.isInteger(talukaId) || talukaId <= 0)) {
      return {
        success: false,
        message: "Taluka ID must be a positive integer or null",
      };
    }

    if (
      sansthaId !== null &&
      (!Number.isInteger(sansthaId) || sansthaId <= 0)
    ) {
      return {
        success: false,
        message: "Sanstha ID must be a positive integer or null",
      };
    }

    if (!subject || !message) {
      return {
        success: false,
        message: "Subject and message are required",
      };
    }

    // Verify sender exists
    const senderCheck = await query(
      "SELECT id FROM users WHERE id = ? AND status = 1",
      [senderUserId]
    );
    if (!senderCheck.length) {
      return { success: false, message: "Sender not found or inactive" };
    }

    // Build user query
    let usersSql = `
      SELECT id, first_name, last_name, fcm_token
      FROM users
      WHERE fcm_token IS NOT NULL
      AND status = '1'
      AND id != ?
    `;
    const queryParams = [senderUserId];

    if (!allUsers) {
      if (caderId !== null) {
        usersSql += ` AND cader_id = ?`;
        queryParams.push(caderId);
      }
      if (departmentId !== null) {
        usersSql += ` AND department_id = ?`;
        queryParams.push(departmentId);
      }
      if (talukaId !== null) {
        usersSql += ` AND taluka_id = ?`;
        queryParams.push(talukaId);
      }
      if (sansthaId !== null) {
        usersSql += ` AND user_sanstha_id = ?`;
        queryParams.push(sansthaId);
      }
    }

    const users = await query(usersSql, queryParams);

    if (!users || users.length === 0) {
      return {
        success: true,
        message: allUsers
          ? "No active users found"
          : "No active users found for the specified filters",
        notificationsSent: 0,
      };
    }

    // Batch notifications and store announcements
    const batchSize = 100;
    const notifications = [];
    const announcementEntries = [];

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const batchNotifications = batch.map(async (user) => {
        const firstName = decryptName(user.first_name);
        const lastName = decryptName(user.last_name);
        const fullName = `${firstName} ${lastName}`.trim();

        if (!fullName) {
          console.warn("⚠️ Could not decrypt name for user ID:", user.id);
          return null;
        }

        const personalizedMessage = `Dear ${fullName}, ${message}`;
        announcementEntries.push([
          senderUserId,
          user.id,
          allUsers ? null : departmentId,
          allUsers ? null : talukaId,
          allUsers ? null : sansthaId,
          allUsers ? null : caderId,
          subject,
          message,
          allUsers,
        ]);

        return sendPushNotification(
          user.fcm_token,
          subject,
          personalizedMessage
        );
      });
      notifications.push(...batchNotifications);
    }

    const results = await Promise.all(notifications);
    const validNotifications = results.filter(
      (result) => result !== null && result.success
    );
    const failedNotifications = results.filter(
      (result) => result !== null && !result.success
    );

    // Store announcements
    if (announcementEntries.length > 0) {
      const insertAnnouncementSql = `
        INSERT INTO tbl_announcement (sender_user_id, receiver_user_id, dept_id, taluka_id, sanstha_id, cader_id, subject, description, all_users)
        VALUES ?
      `;
      await query(insertAnnouncementSql, [announcementEntries]);
    }

    return {
      success: true,
      message: `Notifications sent to ${validNotifications.length} users${
        allUsers
          ? " for all users"
          : ` for ${departmentId ? `department ${departmentId}` : ""}${
              departmentId && (caderId || talukaId || sansthaId) ? ", " : ""
            }${caderId ? `cader ${caderId}` : ""}${
              caderId && (talukaId || sansthaId) ? ", " : ""
            }${talukaId ? `taluka ${talukaId}` : ""}${
              talukaId && sansthaId ? ", " : ""
            }${sansthaId ? `sanstha ${sansthaId}` : ""}`
      }`,
      notificationsSent: validNotifications.length,
      failedNotifications: failedNotifications.length,
      caderId: allUsers ? null : caderId,
      departmentId: allUsers ? null : departmentId,
      talukaId: allUsers ? null : talukaId,
      sansthaId: allUsers ? null : sansthaId,
      allUsers,
    };
  } catch (error) {
    console.error("❌ Error sending announcement:", error);
    return {
      success: false,
      message: "Error sending announcement",
      error: error.message,
    };
  }
};

export const getUserAnnouncements = async (userId) => {
  try {
    // Validate userId
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
      return {
        success: false,
        message: "User ID must be a positive integer",
      };
    }

    // Verify user exists
    const userCheck = await query(
      "SELECT id FROM users WHERE id = ? AND status = 1",
      [userId]
    );
    if (!userCheck.length) {
      return { success: false, message: "User not found or inactive" };
    }

    // Fetch announcements for the user
    const announcementsSql = `
      SELECT id, subject, description, created_at, dept_id, taluka_id, sanstha_id, cader_id, all_users
      FROM tbl_announcement
      WHERE receiver_user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `;
    const announcements = await query(announcementsSql, [userId]);

    if (!announcements || announcements.length === 0) {
      return {
        success: true,
        message: "No announcements found for this user",
        announcements: [],
      };
    }

    const formattedAnnouncements = announcements.map((announcement) => ({
      id: announcement.id,
      subject: announcement.subject,
      description: announcement.description,
      createdAt: announcement.created_at,
      matchedFilter:
        announcement.all_users === 1
          ? "all_users"
          : announcement.dept_id
          ? "department"
          : announcement.taluka_id
          ? "taluka"
          : announcement.sanstha_id
          ? "sanstha"
          : "cader",
    }));

    return {
      success: true,
      message: `${formattedAnnouncements.length} announcement(s) found`,
      announcements: formattedAnnouncements,
    };
  } catch (error) {
    console.error("❌ Error fetching user announcements:", error);
    return {
      success: false,
      message: "Error fetching announcements",
      error: error.message,
    };
  }
};


 export const getCeoAnnouncementsHistory = async (userId) => {
  try {
    // Check if user exists and is not CEO (role_id != 101)
    const userCheckSql = `SELECT id FROM users WHERE id = ?  LIMIT 1`;
    const userResult = await query(userCheckSql, [userId]);
    if (userResult.length === 0) {
        throw new Error('User not found or is a CEO');
    }

    const sql = `
        SELECT 
            a.id,
            a.subject,
            a.description,
            a.created_at,
            a.all_users,
            a.dept_id,
            a.taluka_id,
            a.cader_id,
            dep.dept_name_marathi,
            t.taluka_name,
            c.cader_name
        FROM tbl_announcement a
        LEFT JOIN departments dep ON a.dept_id = dep.id
        LEFT JOIN taluka t ON a.taluka_id = t.id
        LEFT JOIN tbl_cader c ON a.cader_id = c.id
        WHERE a.sender_user_id = ?
        ORDER BY a.created_at DESC
    `;
    const announcements = await query(sql, [userId]);

    return announcements.map(announcement => {
        const result = {
            id: announcement.id,
            subject: announcement.subject,
            description: announcement.description,
            created_at: announcement.created_at
        };

        // If all_users = 1, set all names to "All District Users"
        // if (announcement.all_users) {
        //     result.all_District = 'All District Users';          
        // } else {
        //     // Include names only if their IDs are not NULL
        //     if (announcement.dept_id && announcement.dept_name_marathi) {
        //         result.dept_name_marathi = announcement.dept_name_marathi;
        //     }
        //     if (announcement.taluka_id && announcement.taluka_name) {
        //         result.taluka_name = announcement.taluka_name;
        //     }
        //     if (announcement.cader_id && announcement.cader_name) {
        //         result.cader_name = announcement.cader_name;
        //     }
        //     if (announcement.dept_id && announcement.cader_id && 
        //       announcement.dept_name_marathi && announcement.cader_name) {
        //       result.reciver = `${announcement.dept_name_marathi} - ${announcement.cader_name}`;
        //   }
        // }

         // If all_users = 1, set reciver to "All District Users"
         if (announcement.all_users) {
          result.reciver = 'सर्व जिल्ह्यातील वापरकर्ते';
      } else {
          // Set reciver based on dept_id and/or cader_id
          if (announcement.dept_id && announcement.cader_id && 
              announcement.dept_name_marathi && announcement.cader_name) {
              result.reciver = `${announcement.dept_name_marathi} - ${announcement.cader_name}`;
          } else if (announcement.dept_id && announcement.dept_name_marathi) {
              result.reciver = announcement.dept_name_marathi;
          } else if (announcement.cader_id && announcement.cader_name) {
              result.reciver = announcement.cader_name;
          }
      }
      if (announcement.taluka_id && announcement.taluka_name) {
        result.reciver = announcement.taluka_name;
    }

        return result;
    });
} catch (error) {
    console.error('Error in getAnnouncements service:', error);
    throw new Error(`Failed to retrieve announcements: ${error.message}`);
}

};
