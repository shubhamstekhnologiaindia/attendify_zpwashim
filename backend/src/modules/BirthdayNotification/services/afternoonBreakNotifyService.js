import { sendPushNotification } from "../../../../utils/firebase.js";
import { query } from "../../../../utils/database.js";
import schedule from 'node-schedule';
import moment from 'moment-timezone';

// Cache for shift and override shift data
let shiftCache = [];
let overrideShiftCache = [];

// Load shift data from tbl_shifts
export const loadShiftData = async () => {
  try {
    const sql = `
      SELECT shift_id, afternoon_in_start
      FROM tbl_shifts
      WHERE shift_status = 1
    `;
    const shifts = await query(sql);
    shiftCache = shifts;
    console.log('Shift data loaded:');
    return shifts;
  } catch (error) {
    console.error('❌ Error loading shift data:', error.message);
    throw error;
  }
};

// Load override shift data from tbl_override_shifts
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
    console.log('Override shift data loaded:');
    return overrideShifts;
  } catch (error) {
    console.error('❌ Error loading override shift data:', error.message);
    throw error;
  }
};

// Get users and shift details
export const getUsersForNotifications = async () => {  // 🔧 Removed currentDate param (not needed)
  try {
    const sql = `
      SELECT id, fcm_token, user_shift_id, override_shift_id
      FROM users
      WHERE status = 1 AND fcm_token IS NOT NULL
    `;
    const users = await query(sql);

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

    return usersWithShifts.filter((u) => u.afternoon_in_start);
  } catch (error) {
    console.error('❌ Error fetching users for notifications:', error.message);
    throw error;
  }
};

// Attendance check function
export const checkAttendanceStatus = async (userId) => {  // 🔧 Removed currentDate param (we'll fetch inside)
  try {
    const currentDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");  // 🔧 ADDED
    const sql = `
      SELECT att_morning_in_time, att_afternoon_in_time
      FROM tbl_attendance_records
      WHERE att_employee_id = ? AND att_attendance_date = ?
    `;
    const attendance = await query(sql, [userId, currentDate]);
    const hasMorning = attendance.length > 0 && attendance[0].att_morning_in_time;
    const hasAfternoon = attendance.length > 0 && attendance[0].att_afternoon_in_time;
    return { hasMorning, hasAfternoon };
  } catch (error) {
    console.error('❌ Error checking attendance status:', error.message);
    return { hasMorning: false, hasAfternoon: false };
  }
};

// SEND NOTIFICATION FUNCTION
const sendNotificationForUser = async (user, repeatJobName) => {
  try {
    const { id, fcm_token, shift_id, shift_type } = user;
    const { hasMorning, hasAfternoon } = await checkAttendanceStatus(id);

    if (hasMorning && !hasAfternoon) {
      const title = "Afternoon Attendance Reminder";
      const message = "Please mark your attendance";
      const result = await sendPushNotification(fcm_token, title, message);

      if (result.success) {
        console.log(`✅ Notification sent: User ${id}`);
      } else {
        console.error(`❌ FCM failure for user ${id}: ${result.error}`);
        if (result.error.includes("registration-token-not-registered")) {
          await query("UPDATE users SET fcm_token = NULL WHERE id = ?", [id]);
          console.log(`ℹ️ Invalid token removed for user ${id}`);
        }
      }
    } else {
      if (repeatJobName) {
        const runningJob = schedule.scheduledJobs[repeatJobName];
        if (runningJob) {
          runningJob.cancel();
          // console.log(`🛑 Stopped repeat notifications for user ${id} after attendance marked`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Notification error for user ${user.id}:`, error.message);
  }
};

// 🔧 🔥 THIS FUNCTION WAS MISSING IN YOUR CODE:
export const scheduleNotificationsForUser = async (user) => {
  try {
    const { id, shift_id, shift_type, afternoon_in_start } = user;
    const jobPrefix = `${shift_type}-user-${id}-shift-${shift_id}`;

    const [hours, minutes, seconds] = afternoon_in_start.split(":").map(Number);
    const notificationStart = moment.tz("Asia/Kolkata").set({
      hour: hours,
      minute: minutes,
      second: seconds || 0,
    });

    const cutoffTime = moment(notificationStart).add(1, "hours").add(30, "minutes");  // 🔧 ADDED cutoff time

    // Schedule initial job
    const rule = new schedule.RecurrenceRule();
    rule.tz = "Asia/Kolkata";
    rule.hour = notificationStart.hour();
    rule.minute = notificationStart.minute();
    rule.second = notificationStart.second();

    schedule.scheduleJob(`initial-${jobPrefix}`, rule, async () => {
      console.log(`🔔 [INITIAL] User ${id} | Shift ${shift_id}`);
      await sendNotificationForUser(user);
    });

    // Schedule repeat job every 10 min until cutoff
    const repeatJobName = `repeat-${jobPrefix}`;
    schedule.scheduleJob(repeatJobName, "*/10 * * * *", async () => {
      const now = moment().tz("Asia/Kolkata");
      if (now.isAfter(cutoffTime)) {
        schedule.cancelJob(repeatJobName);
        
        return;
      }
      console.log(`🔄 [REPEAT] User ${id} | Shift ${shift_id}`);
      await sendNotificationForUser(user, repeatJobName);
    });

    // console.log(`✅ Scheduled notifications for user ${id} at ${notificationStart.format("HH:mm:ss")}`);
  } catch (error) {
    console.error(`❌ Error scheduling user ${user.id}:`, error.message);
  }
};

// INITIALIZE SCHEDULER FUNCTION
export const initializeNotificationSchedules = async () => {
  try {
    await loadShiftData();
    await loadOverrideShiftData();
    const users = await getUsersForNotifications();

    console.log(`📊 Scheduling for ${users.length} users`);

    for (const user of users) {
      await scheduleNotificationsForUser(user);
    }

    // Midnight refresh
    schedule.scheduleJob({ hour: 0, minute: 0, tz: "Asia/Kolkata" }, async () => {
      console.log("♻️ Midnight daily refresh triggered");
      await refreshNotificationSchedules();
    });

    console.log("✅ Notification system fully initialized");
  } catch (error) {
    console.error("❌ Initialization failed:", error.message);
  }
};

// REFRESH FUNCTION
export const refreshNotificationSchedules = async () => {
  try {
    
    await schedule.gracefulShutdown();
    shiftCache = [];
    overrideShiftCache = [];

    await loadShiftData();
    await loadOverrideShiftData();

    const users = await getUsersForNotifications();

    console.log(`📊 Refresh scheduling for ${users.length} users`);
    for (const user of users) {
      await scheduleNotificationsForUser(user);
    }
    console.log("✅ Refresh completed");
  } catch (error) {
    console.error("❌ Error during refresh:", error.message);
  }
};

// GRACEFUL SHUTDOWN
process.on('SIGTERM', () => {
  console.log('ℹ️ Shutting down scheduler');
  schedule.gracefulShutdown().then(() => process.exit(0));
});