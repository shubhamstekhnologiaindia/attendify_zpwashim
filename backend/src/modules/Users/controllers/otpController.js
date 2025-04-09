import otpService from '../services/otpService.js';

// Using an object literal for the controller
export const otpController = {
    sendOtp: async (req, res) => {
        try {
            const { mobile } = req.body;

            if (!mobile) {
                return res.status(400).json({
                    success: false,
                    message: 'Mobile number is required'
                });
            }

            await otpService.sendOtp(mobile);
            res.status(200).json({
                success: true,
                message: 'OTP sent successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    
    verifyOtp: async (req, res) => {
        try {
            const { mobile, otp } = req.body;

            if (!mobile || !otp) {
                return res.status(400).json({
                    success: false,
                    message: 'Mobile number and OTP are required'
                });
            }

            const result = otpService.verifyOtp(mobile, otp);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

// No need for a separate default export since we're using a named export