import axios from 'axios';

export class MobileOtpService {
  constructor() {
    this.otpStore = new Map();  // In-memory OTP store
  }

  // Generate random 6-digit OTP
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Validate mobile number format
  validateMobile(mobile) {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  }

  // Send OTP via SMS API
  async sendOtp(mobile) {
    if (!this.validateMobile(mobile)) {
      throw new Error("Invalid mobile number");
    }

    const otp = this.generateOtp();

    const encodedMessage = encodeURIComponent(
      `आपला ओटीपी क्रमांक आहे: ${otp} कृपया हा ओटीपी पुढील प्रक्रियेसाठी वापरा. - Attends Zp-Washim`
    );

     const url = `http://bulksms.saakshisoftware.com/api/mt/SendSMS?user=TECHNOLOGIA&password=70837513&senderid=SNILKN&channel=Trans&DCS=8&flashsms=0&number=${mobile}&text=${encodedMessage}&route=04&DLTTemplateId=1707174402543957427&PEID=1701172491385434035`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data.ErrorCode === "000") {
        // Store OTP and timestamp in memory
        this.otpStore.set(mobile, { otp, timestamp: Date.now() });

        return { success: true, message: 'OTP sent successfully' };
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      console.error("SMS API Error:", error.message);
      throw new Error("SMS API Error: " + error.message);
    }
  }

  // Verify OTP
  verifyOtp(mobile, otp) {
    const storedOtpData = this.otpStore.get(mobile);

    if (!storedOtpData) {
      return { success: false, message: 'OTP not found or expired' };
    }

    // Check OTP expiry (5 mins)
    const timeDiff = (Date.now() - storedOtpData.timestamp) / (1000 * 60);
    if (timeDiff > 5) {
      this.otpStore.delete(mobile);
      return { success: false, message: 'OTP expired' };
    }

    if (storedOtpData.otp === otp) {
      this.otpStore.delete(mobile);
      return { success: true, message: 'OTP verified successfully' };
    }

    return { success: false, message: 'Invalid OTP' };
  }
}

export const mobileOtpService = new MobileOtpService();
