// import axios from 'axios';

// const otpStore = new Map(); // module-level OTP store

// export const FlushDBService = {
//     // Generate 6-digit OTP
//     generateOtp() {
//         return Math.floor(100000 + Math.random() * 900000).toString();
//     },

//     // Validate Indian mobile number
//     validateMobileNumber(mobile) {
//         const mobileRegex = /^[6-9]\d{9}$/;
//         return mobileRegex.test(mobile);
//     },

//     // Send OTP via SMS
//     sendOtp: async (mobile) => {
//         if (!FlushDBService.validateMobileNumber(mobile)) {
//             throw new Error('Invalid mobile number');
//         }

//         const otp = FlushDBService.generateOtp();
//         const encodedMessage = encodeURIComponent(
//             `आपला ओटीपी क्रमांक आहे: ${otp} कृपया हा ओटीपी पुढील प्रक्रियेसाठी वापरा.`
//         );

//         const url = `http://bulksms.saakshisoftware.com/api/mt/SendSMS?user=TECHNOLOGIA&password=70837513&senderid=SNILKT&channel=Trans&DCS=8&flashsms=0&number=${mobile}&text=${encodedMessage}&route=04&DLTTemplateId=1707174402543957427&PEID=1701172491385434035`;

//         try {
//             const response = await axios.get(url);

//             if (response.data.ErrorCode === "000") {
//                 // Store OTP with timestamp
//                 otpStore.set(mobile, {
//                     otp,
//                     timestamp: Date.now()
//                 });
//                 return true;
//             }

//             throw new Error('Failed to send OTP');
//         } catch (error) {
//             throw new Error(`SMS API error: ${error.message}`);
//         }
//     },

//     // Verify OTP
//     verifyOtp: async (mobile, otp) => {
//         const storedOtpData = otpStore.get(mobile);

//         if (!storedOtpData) {
//             return { success: false, message: 'OTP not found or expired' };
//         }

//         const timeDiff = (Date.now() - storedOtpData.timestamp) / 1000 / 60; // in minutes

//         if (timeDiff > 5) {
//             otpStore.delete(mobile);
//             return { success: false, message: 'OTP expired' };
//         }

//         if (storedOtpData.otp === otp) {
//             otpStore.delete(mobile);
//             return { success: true, message: 'OTP verified successfully' };
//         }

//         return { success: false, message: 'Invalid OTP' };
//     }
// };

