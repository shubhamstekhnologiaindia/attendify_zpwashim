import axios from 'axios';

export class OtpService {
    constructor() {
        this.otpStore = new Map(); // Temporary storage for OTPs
    }

    // Generate 6-digit OTP
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Validate mobile number (basic Indian number validation)
    validateMobileNumber(mobile) {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(mobile);
    }

    // Send OTP via SMS
    async sendOtp(mobile) {
        if (!this.validateMobileNumber(mobile)) {
            throw new Error('Invalid mobile number');
        }

        const otp = this.generateOtp();
        const encodedMessage = encodeURIComponent(
            `आपला ओटीपी क्रमांक आहे: ${otp} कृपया हा ओटीपी पुढील प्रक्रियेसाठी वापरा. - SHRI NILKANTHESHWAR`
        );

        const url = `http://bulksms.saakshisoftware.com/api/mt/SendSMS?user=TECHNOLOGIA&password=70837513&senderid=SNILKT&channel=Trans&DCS=8&flashsms=0&number=${mobile}&text=${encodedMessage}&route=04&DLTTemplateId=1707174402543957427&PEID=1701172491385434035`;

        try {
            const response = await axios.get(url);
            if (response.data.ErrorCode === "000") {
                // Store OTP with timestamp
                this.otpStore.set(mobile, {
                    otp,
                    timestamp: Date.now()
                });
                return true;
            }
            throw new Error('Failed to send OTP');
        } catch (error) {
            throw new Error(`SMS API error: ${error.message}`);
        }
    }

    // Verify OTP
    verifyOtp(mobile, otp) {
        const storedOtpData = this.otpStore.get(mobile);
        
        if (!storedOtpData) {
            return { success: false, message: 'OTP not found or expired' };
        }

        // Check if OTP is expired (e.g., 5 minutes validity)
        const timeDiff = (Date.now() - storedOtpData.timestamp) / 1000 / 60;
        if (timeDiff > 5) {
            this.otpStore.delete(mobile);
            return { success: false, message: 'OTP expired' };
        }

        if (storedOtpData.otp === otp) {
            this.otpStore.delete(mobile); // Clear OTP after successful verification
            return { success: true, message: 'OTP verified successfully' };
        }

        return { success: false, message: 'Invalid OTP' };
    }
}

// Create a singleton instance
const otpService = new OtpService();
export default otpService;