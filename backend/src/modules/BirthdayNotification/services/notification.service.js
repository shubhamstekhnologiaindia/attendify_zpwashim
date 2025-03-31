const admin = require("../firebase");

const sendPushNotification = async (fcmToken, message) => {
  const notificationPayload = {
    notification: {
      title: "🎉 Happy Birthday!",
      body: message,
      sound: "default",
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(notificationPayload);
    console.log("Notification sent successfully:", response);
    return { success: true, message: "Notification sent successfully" };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, message: "Failed to send notification", error };
  }
};

module.exports = { sendPushNotification };

