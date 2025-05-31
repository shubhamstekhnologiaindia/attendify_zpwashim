import { sendPushNotification } from "../../../../utils/firebase.js";
import { query } from "../../../../utils/database.js";
import schedule from 'node-schedule';
import moment from 'moment-timezone';

// Cache for shift and override shift data
let shiftCache = [];
let overrideShiftCache = [];

// Function to load shift data from tbl_shifts
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

// Function to load override shift data from tbl_override_shifts
// NEW: Added to fetch override shift data
export const loadOverrideShiftData = async () => {
  try {
    const sql = `
      SELECT override_shift_id, ovrr_afternoon_in_start
      FROM tbl_override_shifts
      WHERE ovrr_status = 1
      AND ovrr_start_date <= CURDATE()
      AND ovrr_end_date >= CURDATE()
    `;
    const overrideShifts = await query(sql);
    overrideShiftCache = overrideShifts;
    console.log('✅ Override shift data loaded:', overrideShifts);
    return overrideShifts;
  } catch (error) {
    console.error('❌ Error loading override shift data:', error.message);
    throw error;
  }
};

// Function to get users and their shift details (regular or override)
export const getUsersForNotifications = async (currentDate) => {
  try {
    const sql = `
      SELECT id, fcm_token, user_shift_id, override_shift_id
      FROM users
      WHERE status = 1 AND fcm_token IS NOT NULL
    `;
    const users = await query(sql);
    console.log(`ℹ️ Found ${users.length} active users with FCM tokens`);

    // Map users to their shift or override shift details
    const usersWithShifts = users.map((user) => {
      if (user.override_shift_id) {
        const overrideShift = overrideShiftCache.find(
          (os) => os.override_shift_id === user.override_shift_id
        );
        if (overrideShift) {
          return {
            id: user.id,
            fcm_token: user.fcm_token,
            shift_type: 'override',
            shift_id: user.override_shift_id,
            afternoon_in_start: overrideShift.ovrr_afternoon_in_start,
          };
        }
      }
      const shift = shiftCache.find((s) => s.shift_id === user.user_shift_id);
      return {
        id: user.id,
        fcm_token: user.fcm_token,
        shift_type: 'regular',
        shift_id: user.user_shift_id,
        afternoon_in_start: shift ? shift.afternoon_in_start : null,
      };
    });

    // Filter out users with no valid shift
    const validUsers = usersWithShifts.filter((u) => u.afternoon_in_start);
    console.log(`ℹ️ Found ${validUsers.length} users with valid shifts`);
    return validUsers;
  } catch (error) {
    console.error('❌ Error fetching users for notifications:', error.message);
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

// Function to schedule notifications for a specific user and shift
export const scheduleNotificationsForUser = async (user) => {
  try {
    const { id, shift_id, shift_type, afternoon_in_start } = user;
    const jobPrefix = `${shift_type}-notify-user-${id}-shift-${shift_id}`;

    console.log(`Scheduling ${shift_type} shift ${shift_id} for user ${id} with afternoon_in_start: ${afternoon_in_start}`);

    // Parse afternoon_in_start (e.g., '18:18:00') and set initial notification 5 minutes earlier
    const [hours, minutes, seconds] = afternoon_in_start.split(':').map(Number);
    const notificationStart = moment.tz('Asia/Kolkata').set({
      hour: hours,
      minute: minutes - 5,
      second: seconds || 0,
    });

    // Define cutoff time (default: 2 hours after notification start)
    // CONFIG: Adjust cutoff duration here (e.g., change '2' to '3' for 3 hours)
    const cutoffTime = moment(notificationStart).add(2, 'hours');

    const rule = new schedule.RecurrenceRule();
    rule.hour = notificationStart.hour();
    rule.minute = notificationStart.minute();
    rule.second = notificationStart.second() || 0;
    rule.tz = 'Asia/Kolkata';

    // Initial notification job
    schedule.scheduleJob(`initial-${jobPrefix}`, rule, async () => {
      console.log(`Running initial ${shift_type} notification for user ${id}, shift ${shift_id} at ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')}`);
      await sendNotificationForUser(user);
    });

    // Repetitive notification job (every 5 minutes until cutoff or afternoon marked)
    // CONFIG: Adjust repeat interval here (e.g., '*/10 * * * *' for every 10 minutes)
    schedule.scheduleJob(`repeat-${jobPrefix}`, '*/5 * * * *', async () => {
      const now = moment().tz('Asia/Kolkata');
      if (now.isAfter(cutoffTime)) {
        console.log(`ℹ️ Stopping repeat notifications for user ${id}, shift ${shift_id} (cutoff reached)`);
        schedule.cancelJob(`repeat-${jobPrefix}`);
        return;
      }

      console.log(`Running repeat ${shift_type} notification for user ${id}, shift ${shift_id} at ${now.format('YYYY-MM-DD HH:mm:ss')}`);
      await sendNotificationForUser(user);
    });

    console.log(`✅ Scheduled ${shift_type} notifications for user ${id}, shift ${shift_id} starting at ${notificationStart.format('HH:mm:ss')} IST`);
  } catch (error) {
    console.error(`❌ Error scheduling notifications for user ${user.id}:`, error.message);
    throw error;
  }
};

// Helper function to send notification for a single user
const sendNotificationForUser = async (user) => {
  try {
    const { id, fcm_token, shift_id, shift_type } = user;
    const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    const { hasMorning, hasAfternoon } = await checkAttendanceStatus(id, currentDate);

    if (hasMorning && !hasAfternoon) {
      const title = 'Afternoon Attendance Reminder';
      const message = 'plz mark attendance';
      const result = await sendPushNotification(fcm_token, title, message);

      if (result.success) {
        console.log(`✅ Notification sent to user ${id} with token ${fcm_token} for ${shift_type} shift ${shift_id}`);
      } else {
        console.error(`❌ Failed to send notification to user ${id}: ${result.error}`);
        if (result.error.includes('registration-token-not-registered')) {
          await query('UPDATE users SET fcm_token = NULL WHERE id = ?', [id]);
          console.log(`ℹ️ Nullified invalid FCM token for user ${id}`);
        }
      }
      return result;
    }
    return null;
  } catch (error) {
    console.error(`❌ Error sending notification for user ${user.id}:`, error.message);
    return null;
  }
};

// Function to initialize notification schedules
export const initializeNotificationSchedules = async () => {
  try {
    // Load both regular and override shift data
    await loadShiftData();
    await loadOverrideShiftData();

    const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    const users = await getUsersForNotifications(currentDate);

    if (!users || users.length === 0) {
      console.log('ℹ️ No users with valid shifts found.');
      return;
    }

    for (const user of users) {
      await scheduleNotificationsForUser(user);
    }

    // Refresh shift data daily at midnight IST
    // CONFIG: Adjust refresh time here (e.g., change to 'hour: 1' for 1 AM IST)
    schedule.scheduleJob({ hour: 0, minute: 0, tz: 'Asia/Kolkata' }, async () => {
      console.log('ℹ️ Refreshing shift data daily');
      await loadShiftData();
      await loadOverrideShiftData();
      await schedule.gracefulShutdown();
      const refreshedUsers = await getUsersForNotifications(currentDate);
      for (const user of refreshedUsers) {
        await scheduleNotificationsForUser(user);
      }
    });

    console.log('✅ Notification schedules initialized');
  } catch (error) {
    console.error('❌ Error initializing notification schedules:', error.message);
    throw error;
  }
};

// Function to refresh notification schedules after shift update
// NEW: Added to handle manual shift updates
export const refreshNotificationSchedules = async () => {
  try {
    console.log('ℹ️ Refreshing notification schedules due to shift update');
    await schedule.gracefulShutdown(); // Cancel all existing jobs
    shiftCache = []; // Clear shift cache
    overrideShiftCache = []; // Clear override shift cache
    const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    await loadShiftData();
    await loadOverrideShiftData();
    const users = await getUsersForNotifications(currentDate);

    if (!users || users.length === 0) {
      console.log('ℹ️ No users with valid shifts found after refresh.');
      return { success: true, message: 'No users with valid shifts found.' };
    }

    for (const user of users) {
      await scheduleNotificationsForUser(user);
    }

    console.log('✅ Notification schedules refreshed');
    return { success: true, message: 'Notification schedules refreshed successfully' };
  } catch (error) {
    console.error('❌ Error refreshing notification schedules:', error.message);
    return { success: false, message: 'Error refreshing notification schedules', error: error.message };
  }
};

// Function for manual notification testing
export const sendManualNotifications = async () => {
  try {
    const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    const users = await getUsersForNotifications(currentDate);

    if (!users || users.length === 0) {
      return { success: true, message: 'No users with valid shifts found.' };
    }

    const results = [];
    const shiftResults = {};

    for (const user of users) {
      await sendNotificationForUser(user);
      const { shift_id, shift_type } = user;
      const key = `${shift_type}-${shift_id}`;
      if (!shiftResults[key]) {
        shiftResults[key] = { shift_id, shift_type, sent: 0, details: [] };
      }
      const { hasMorning, hasAfternoon } = await checkAttendanceStatus(user.id, currentDate);
      if (hasMorning && !hasAfternoon) {
        shiftResults[key].sent += 1;
      }
    }

    results.push(...Object.values(shiftResults));

    return {
      success: true,
      message: `Manual notifications sent for ${results.length} shifts`,
      results,
    };
  } catch (error) {
    console.error('❌ Error in manual notification:', error.message);
    return { success: false, message: 'Error sending manual notifications', error: error.message };
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('ℹ️ Shutting down scheduler');
  schedule.gracefulShutdown().then(() => process.exit(0));
});







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

// // Function to check if user has marked morning attendance and not afternoon
// export const checkAttendanceStatus = async (userId, currentDate) => {
//   try {
//     const sql = `
//       SELECT att_morning_in_time, att_afternoon_in_time
//       FROM tbl_attendance_records
//       WHERE att_employee_id = ? AND att_attendance_date = ?
//     `;
//     const attendance = await query(sql, [userId, currentDate]);
//     const hasMorning = attendance.length > 0 && attendance[0].att_morning_in_time;
//     const hasAfternoon = attendance.length > 0 && attendance[0].att_afternoon_in_time;
//     console.log(`ℹ️ User ${userId} morning: ${hasMorning}, afternoon: ${hasAfternoon}`);
//     return { hasMorning, hasAfternoon };
//   } catch (error) {
//     console.error('❌ Error checking attendance status:', error.message);
//     throw error;
//   }
// };

// // Function to schedule notifications for a specific shift
// export const scheduleNotificationsForShift = async (shift) => {
//   try {
//     const { shift_id, afternoon_in_start } = shift;
//     console.log('error ',typeof afternoon_in_start)

//     // Parse afternoon_in_start (e.g., '18:18:00') and set initial notification 5 minutes earlier
//     const [hours, minutes, seconds] = afternoon_in_start.split(':').map(Number);
//     const notificationStart = moment.tz('Asia/Kolkata').set({
//       hour: hours,
//       minute: minutes - 5,
//       second: seconds || 0,
//     });

//     // Define cutoff time (e.g., 2 hours after afternoon_in_start)
//     const cutoffTime = moment(notificationStart).add(2, 'hours');

//     const rule = new schedule.RecurrenceRule();
//     rule.hour = notificationStart.hour();
//     rule.minute = notificationStart.minute();
//     rule.second = notificationStart.second() || 0;
//     rule.tz = 'Asia/Kolkata';

//     // Initial notification job
//     schedule.scheduleJob(`initial-notify-shift-${shift_id}`, rule, async () => {
//       console.log(`Running initial notification job for shift ${shift_id} at ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')}`);
//       await sendNotificationsForShift(shift_id);
//     });

//     // Repetitive notification job (every 5 minutes until cutoff or afternoon marked)
//     schedule.scheduleJob(`repeat-notify-shift-${shift_id}`, '*/5 * * * *', async () => {
//       const now = moment().tz('Asia/Kolkata');
//       if (now.isAfter(cutoffTime)) {
//         console.log(`ℹ️ Stopping repeat notifications for shift ${shift_id} (cutoff reached)`);
//         schedule.cancelJob(`repeat-notify-shift-${shift_id}`);
//         return;
//       }

//       console.log(`Running repeat notification job for shift ${shift_id} at ${now.format('YYYY-MM-DD HH:mm:ss')}`);
//       await sendNotificationsForShift(shift_id);
//     });

//     console.log(`✅ Scheduled notifications for shift ${shift_id} starting at ${notificationStart.format('HH:mm:ss')} IST`);
//   } catch (error) {
//     console.error('❌ Error scheduling notifications for shift:', error.message);
//     throw error;
//   }
// };

// // Helper function to send notifications for a shift
// const sendNotificationsForShift = async (shiftId) => {
//   try {
//     const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
//     const users = await getUsersForShift(shiftId, currentDate);

//     const notifications = users.map(async (user) => {
//       const { id, fcm_token } = user;
//       const { hasMorning, hasAfternoon } = await checkAttendanceStatus(id, currentDate);

//       if (hasMorning && !hasAfternoon) {
//         const title = 'Afternoon Attendance Reminder';
//         const message = 'plz mark attendance';
//         const result = await sendPushNotification(fcm_token, title, message);

//         if (result.success) {
//           console.log(`✅ Notification sent to user ${id} with token ${fcm_token}`);
//         } else {
//           console.error(`❌ Failed to send notification to user ${id}: ${result.error}`);
//         }
//         return result;
//       }
//       return null;
//     });

//     const validNotifications = notifications.filter((n) => n !== null);
//     await Promise.all(validNotifications);
//     console.log(`ℹ️ Sent ${validNotifications.length} notifications for shift ${shiftId}`);
//   } catch (error) {
//     console.error(`❌ Error sending notifications for shift ${shiftId}:`, error.message);
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
// // export const sendManualNotifications = async () => {
// //   try {
// //     const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
// //     const shifts = await loadShiftData();

// //     if (!shifts || shifts.length === 0) {
// //       return { success: true, message: 'No active shifts found.' };
// //     }

// //     const results = [];

// //     for (const shift of shifts) {
// //       const { shift_id } = shift;
// //       await sendNotificationsForShift(shift_id);
// //       const users = await getUsersForShift(shift_id, currentDate);
// //       const sentCount = users.filter(async (user) => {
// //         const { hasMorning, hasAfternoon } = await checkAttendanceStatus(user.id, currentDate);
// //         return hasMorning && !hasAfternoon;
// //       }).length;
// //       results.push({ shift_id, sent: sentCount, details: [] });
// //     }

// //     return {
// //       success: true,
// //       message: `Manual notifications sent for ${results.length} shifts`,
// //       results,
// //     };
// //   } catch (error) {
// //     console.error('❌ Error in manual notification:', error.message);
// //     return { success: false, message: 'Error sending manual notifications', error: error.message };
// //   }
// // };

// // Handle graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('ℹ️ Shutting down scheduler');
//   schedule.gracefulShutdown().then(() => process.exit(0));
// });