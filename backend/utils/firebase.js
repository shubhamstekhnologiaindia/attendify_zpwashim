// import admin from"firebase-admin";
// import serviceAccount from"/FireBaseConfg.json";

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// export const sendPushNotification = async (fcmToken, title, message) => {
//   try {
//     const payload = {
//       notification: {
//         title: title,
//         body: message,
//       },
//       token: fcmToken,
//     };

//     const response = await admin.messaging().send(payload);
//     console.log("✅ FCM Notification Sent:", response);
//     return response;
//   } catch (error) {
//     console.error("❌ Error sending FCM:", error);
//     return null;
//   }
// };