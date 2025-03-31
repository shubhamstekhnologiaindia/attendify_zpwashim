const { sendPushNotification } = require("./notification.service");
// Simulated user data (Replace with DB query)
const users = [
  { name: "John Doe", mobile: "9876543210", fcmToken: "SAMPLE_FCM_TOKEN_1" },
  { name: "Jane Smith", mobile: "8765432109", fcmToken: "SAMPLE_FCM_TOKEN_2" },
];

const sendBirthdayNotification = async (req, res) => {
  try {
    const birthdayUsers = users; // Ideally, fetch users with today’s birthday from DB

    for (const user of birthdayUsers) {
      const message = `Dear ${user.name}, Happy Birthday! 🎂 Enjoy your day!`;
      await sendPushNotification(user.fcmToken, message);
    }

    res.status(200).json({
      success: true,
      message: "Birthday notifications sent successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

module.exports = { sendBirthdayNotification };
