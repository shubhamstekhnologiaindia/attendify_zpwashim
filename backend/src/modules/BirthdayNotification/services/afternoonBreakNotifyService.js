import { sendPushNotification } from "../../../../utils/firebase.js";
import { query } from "../../../../utils/database.js";
import schedule from 'node-schedule';
import moment from 'moment-timezone';


// // Cache for shift data
// let shiftCache = [];

// // Function to load shift data
// export const loadShiftData = async () => {
//   try {
//     const sql = `
//       SELECT shift_id, afternoon_in_start
//       FROM tbl_shifts
//       WHERE shift_status = 1
//     `;
//     const shifts = await query(sql);
//     shiftCache = shifts;
//     console.log('✅ Shift data loaded:', shifts);
//     return shifts;
//   } catch (error) {
//     console.error('❌ Error loading shift data:', error.message);
//     throw error;
//   }
// };

// // Function to get users for a specific shift
// export const getUsersForShift = async (shiftId, currentDate) => {
//   try {
//     const sql = `
//       SELECT id, fcm_token
//       FROM users
//       WHERE user_shift_id = ? AND status = 1 AND fcm_token IS NOT NULL
//     `;
//     const users = await query(sql, [shiftId]);
//     console.log(`ℹ️ Found ${users.length} users for shift ${shiftId}`);
//     return users;
//   } catch (error) {
//     console.error('❌ Error fetching users for shift:', error.message);
//     throw error;
//   }
// };

// // Function to check if user has marked morning attendance
// export const hasMorningAttendance = async (userId, currentDate) => {
//   try {
//     const sql = `
//       SELECT att_morning_in_time
//       FROM tbl_attendance_records
//       WHERE att_employee_id = ? AND att_attendance_date = ?
//     `;
//     const attendance = await query(sql, [userId, currentDate]);
//     const hasAttendance = attendance.length > 0 && attendance[0].att_morning_in_time;
//     console.log(`ℹ️ User ${userId} morning attendance: ${hasAttendance}`);
//     return hasAttendance;
//   } catch (error) {
//     console.error('❌ Error checking morning attendance:', error.message);
//     throw error;
//   }
// };

// // Function to schedule notifications for a specific shift
// export const scheduleNotificationsForShift = async (shift) => {
//   try {
//     const { shift_id, afternoon_in_start } = shift;

//     // Parse afternoon_in_start (e.g., '18:18:00') and set notification 5 minutes earlier
//     const [hours, minutes, seconds] = afternoon_in_start.split(':').map(Number);
//     const notificationTime = moment.tz('Asia/Kolkata').set({
//       hour: hours,
//       minute: minutes - 5,
//       second: seconds || 0,
//     });

//     const rule = new schedule.RecurrenceRule();
//     rule.hour = notificationTime.hour();
//     rule.minute = notificationTime.minute();
//     rule.second = notificationTime.second() || 0;
//     rule.tz = 'Asia/Kolkata';

//     schedule.scheduleJob(`notify-shift-${shift_id}`, rule, async () => {
//       console.log(`Running notification job for shift ${shift_id} at ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')}`);
//       try {
//         const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
//         const users = await getUsersForShift(shift_id, currentDate);

//         const notifications = users.map(async (user) => {
//           const { id, fcm_token } = user;

//           if (await hasMorningAttendance(id, currentDate)) {
//             const title = 'Afternoon Attendance Reminder';
//             const message = 'plz mark attendance';
//             const result = await sendPushNotification(fcm_token, title, message);

//             if (result.success) {
//               console.log(`✅ Notification sent to user ${id} with token ${fcm_token}`);
//             } else {
//               console.error(`❌ Failed to send notification to user ${id}: ${result.error}`);
//             }
//             return result;
//           }
//           return null;
//         });

//         const validNotifications = notifications.filter((n) => n !== null);
//         await Promise.all(validNotifications);
//         console.log(`ℹ️ Sent ${validNotifications.length} notifications for shift ${shift_id}`);
//       } catch (error) {
//         console.error(`❌ Error in notification job for shift ${shift_id}:`, error.message);
//       }
//     });

//     console.log(`✅ Scheduled notifications for shift ${shift_id} at ${notificationTime.format('HH:mm:ss')} IST`);
//   } catch (error) {
//     console.error('❌ Error scheduling notifications for shift:', error.message);
//     throw error;
//   }
// };

// // Function to initialize notification schedules
// export const initializeNotificationSchedules = async () => {
//   try {
//     const shifts = await loadShiftData();

//     if (!shifts || shifts.length === 0) {
//       console.log('ℹ️ No active shifts found.');
//       return;
//     }

//     for (const shift of shifts) {
//       await scheduleNotificationsForShift(shift);
//     }

//     // Refresh shift data daily at midnight IST
//     schedule.scheduleJob({ hour: 0, minute: 0, tz: 'Asia/Kolkata' }, async () => {
//       console.log('ℹ️ Refreshing shift data');
//       await loadShiftData();
//       await schedule.gracefulShutdown();
//       for (const shift of shiftCache) {
//         await scheduleNotificationsForShift(shift);
//       }
//     });

//     console.log('✅ Notification schedules initialized');
//   } catch (error) {
//     console.error('❌ Error initializing notification schedules:', error.message);
//     throw error;
//   }
// };

// // Function for manual notification testing
// export const sendManualNotifications = async () => {
//   try {
//     const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
//     const shifts = await loadShiftData();

//     if (!shifts || shifts.length === 0) {
//       return { success: true, message: 'No active shifts found.' };
//     }

//     const results = [];

//     for (const shift of shifts) {
//       const { shift_id } = shift;
//       const users = await getUsersForShift(shift_id, currentDate);
//       const notifications = users.map(async (user) => {
//         const { id, fcm_token } = user;
//         if (await hasMorningAttendance(id, currentDate)) {
//           const title = 'Afternoon Attendance Reminder (Manual)';
//           const message = 'plz mark attendance';
//           const result = await sendPushNotification(fcm_token, title, message);
//           return { userId: id, success: result.success, error: result.error || null };
//         }
//         return null;
//       });

//       const validNotifications = notifications.filter((n) => n !== null);
//       const sentNotifications = await Promise.all(validNotifications);
//       results.push({ shift_id, sent: sentNotifications.length, details: sentNotifications });
//     }

//     return {
//       success: true,
//       message: `Manual notifications sent for ${results.length} shifts`,
//       results,
//     };
//   } catch (error) {
//     console.error('❌ Error in manual notification:', error.message);
//     return { success: false, message: 'Error sending manual notifications', error: error.message };
//   }
// };

// // Handle graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('ℹ️ Shutting down scheduler');
//   schedule.gracefulShutdown().then(() => process.exit(0));
// });







// Cache for shift data
let shiftCache = [];

// Function to load shift data
export const loadShiftData = async () => {
  try {
    const sql = `
      SELECT shift_id, afternoon_in_start
      FROM tbl_shifts
      WHERE shift_status = 1
    `;
    const shifts = await query(sql);
    shiftCache = shifts;
    console.log('✅ Shift data loaded:', shifts);
    return shifts;
  } catch (error) {
    console.error('❌ Error loading shift data:', error.message);
    throw error;
  }
};

// Function to get users for a specific shift
export const getUsersForShift = async (shiftId, currentDate) => {
  try {
    const sql = `
      SELECT id, fcm_token
      FROM users
      WHERE user_shift_id = ? AND status = 1 AND fcm_token IS NOT NULL
    `;
    const users = await query(sql, [shiftId]);
    console.log(`ℹ️ Found ${users.length} users for shift ${shiftId}`);
    return users;
  } catch (error) {
    console.error('❌ Error fetching users for shift:', error.message);
    throw error;
  }
};

// Function to check if user has marked morning attendance and not afternoon
export const checkAttendanceStatus = async (userId, currentDate) => {
  try {
    const sql = `
      SELECT att_morning_in_time, att_afternoon_in_time
      FROM tbl_attendance_records
      WHERE att_employee_id = ? AND att_attendance_date = ?
    `;
    const attendance = await query(sql, [userId, currentDate]);
    const hasMorning = attendance.length > 0 && attendance[0].att_morning_in_time;
    const hasAfternoon = attendance.length > 0 && attendance[0].att_afternoon_in_time;
    console.log(`ℹ️ User ${userId} morning: ${hasMorning}, afternoon: ${hasAfternoon}`);
    return { hasMorning, hasAfternoon };
  } catch (error) {
    console.error('❌ Error checking attendance status:', error.message);
    throw error;
  }
};

// Function to schedule notifications for a specific shift
export const scheduleNotificationsForShift = async (shift) => {
  try {
    const { shift_id, afternoon_in_start } = shift;
    console.log('error ',typeof afternoon_in_start)

    // Parse afternoon_in_start (e.g., '18:18:00') and set initial notification 5 minutes earlier
    const [hours, minutes, seconds] = afternoon_in_start.split(':').map(Number);
    const notificationStart = moment.tz('Asia/Kolkata').set({
      hour: hours,
      minute: minutes - 5,
      second: seconds || 0,
    });

    // Define cutoff time (e.g., 2 hours after afternoon_in_start)
    const cutoffTime = moment(notificationStart).add(2, 'hours');

    const rule = new schedule.RecurrenceRule();
    rule.hour = notificationStart.hour();
    rule.minute = notificationStart.minute();
    rule.second = notificationStart.second() || 0;
    rule.tz = 'Asia/Kolkata';

    // Initial notification job
    schedule.scheduleJob(`initial-notify-shift-${shift_id}`, rule, async () => {
      console.log(`Running initial notification job for shift ${shift_id} at ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')}`);
      await sendNotificationsForShift(shift_id);
    });

    // Repetitive notification job (every 5 minutes until cutoff or afternoon marked)
    schedule.scheduleJob(`repeat-notify-shift-${shift_id}`, '*/5 * * * *', async () => {
      const now = moment().tz('Asia/Kolkata');
      if (now.isAfter(cutoffTime)) {
        console.log(`ℹ️ Stopping repeat notifications for shift ${shift_id} (cutoff reached)`);
        schedule.cancelJob(`repeat-notify-shift-${shift_id}`);
        return;
      }

      console.log(`Running repeat notification job for shift ${shift_id} at ${now.format('YYYY-MM-DD HH:mm:ss')}`);
      await sendNotificationsForShift(shift_id);
    });

    console.log(`✅ Scheduled notifications for shift ${shift_id} starting at ${notificationStart.format('HH:mm:ss')} IST`);
  } catch (error) {
    console.error('❌ Error scheduling notifications for shift:', error.message);
    throw error;
  }
};

// Helper function to send notifications for a shift
const sendNotificationsForShift = async (shiftId) => {
  try {
    const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    const users = await getUsersForShift(shiftId, currentDate);

    const notifications = users.map(async (user) => {
      const { id, fcm_token } = user;
      const { hasMorning, hasAfternoon } = await checkAttendanceStatus(id, currentDate);

      if (hasMorning && !hasAfternoon) {
        const title = 'Afternoon Attendance Reminder';
        const message = 'plz mark attendance';
        const result = await sendPushNotification(fcm_token, title, message);

        if (result.success) {
          console.log(`✅ Notification sent to user ${id} with token ${fcm_token}`);
        } else {
          console.error(`❌ Failed to send notification to user ${id}: ${result.error}`);
        }
        return result;
      }
      return null;
    });

    const validNotifications = notifications.filter((n) => n !== null);
    await Promise.all(validNotifications);
    console.log(`ℹ️ Sent ${validNotifications.length} notifications for shift ${shiftId}`);
  } catch (error) {
    console.error(`❌ Error sending notifications for shift ${shiftId}:`, error.message);
  }
};

// Function to initialize notification schedules
export const initializeNotificationSchedules = async () => {
  try {
    const shifts = await loadShiftData();

    if (!shifts || shifts.length === 0) {
      console.log('ℹ️ No active shifts found.');
      return;
    }

    for (const shift of shifts) {
      await scheduleNotificationsForShift(shift);
    }

    // Refresh shift data daily at midnight IST
    schedule.scheduleJob({ hour: 0, minute: 0, tz: 'Asia/Kolkata' }, async () => {
      console.log('ℹ️ Refreshing shift data');
      await loadShiftData();
      await schedule.gracefulShutdown();
      for (const shift of shiftCache) {
        await scheduleNotificationsForShift(shift);
      }
    });

    console.log('✅ Notification schedules initialized');
  } catch (error) {
    console.error('❌ Error initializing notification schedules:', error.message);
    throw error;
  }
};

// Function for manual notification testing
// export const sendManualNotifications = async () => {
//   try {
//     const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
//     const shifts = await loadShiftData();

//     if (!shifts || shifts.length === 0) {
//       return { success: true, message: 'No active shifts found.' };
//     }

//     const results = [];

//     for (const shift of shifts) {
//       const { shift_id } = shift;
//       await sendNotificationsForShift(shift_id);
//       const users = await getUsersForShift(shift_id, currentDate);
//       const sentCount = users.filter(async (user) => {
//         const { hasMorning, hasAfternoon } = await checkAttendanceStatus(user.id, currentDate);
//         return hasMorning && !hasAfternoon;
//       }).length;
//       results.push({ shift_id, sent: sentCount, details: [] });
//     }

//     return {
//       success: true,
//       message: `Manual notifications sent for ${results.length} shifts`,
//       results,
//     };
//   } catch (error) {
//     console.error('❌ Error in manual notification:', error.message);
//     return { success: false, message: 'Error sending manual notifications', error: error.message };
//   }
// };

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('ℹ️ Shutting down scheduler');
  schedule.gracefulShutdown().then(() => process.exit(0));
});