import cron from 'node-cron';
import { query } from '../utils/database.js';
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




// Schedule deletion of old birthday messages to run hourly
cron.schedule('0 0 * * *', async () => {
  try {
    console.log("ℹ️ Running hourly birthday messages cleanup");
    const sql = `
      DELETE FROM birthday_messages
      WHERE created_at < NOW() - INTERVAL 24 HOUR
    `;
    const result = await query(sql);
    console.log(`✅ Deleted ${result.affectedRows} old birthday messages`);
  } catch (error) {
    console.error("❌ Error in scheduled birthday messages cleanup:", error);
  }
});

// Log when the cron job starts
console.log("ℹ️ Birthday notification cron job started");