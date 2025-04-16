import cron from 'node-cron';
import { sendBirthdayMessages } from '../src/modules/BirthdayNotification/services/notificationService.js';

// Schedule birthday notifications to run daily at 9:00 AM
cron.schedule('0 11 * * *', async () => {
  try {
    console.log("ℹ️ Running daily birthday notification check");
    const response = await sendBirthdayMessages();
    console.log("✅ Birthday notification result:", response);
  } catch (error) {
    console.error("❌ Error in scheduled birthday notifications:", error);
  }
});

// Log when the cron job starts
console.log("ℹ️ Birthday notification cron job started");