import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = path.resolve("./firebaseConfig.json");

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const sendPushNotification = async (fcmToken, title, message) => {
  try {
    if (!fcmToken) {
      throw new Error("FCM token is missing");
    }

    const payload = {
      notification: {
        title,
        body: message,
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(payload);
    console.log("✅ FCM Notification Sent Successfully:", response);
    return { success: true, response };
  } catch (error) {
    console.error("❌ Error sending FCM Notification:", error);
    return { success: false, error: error.message };
  }
};
