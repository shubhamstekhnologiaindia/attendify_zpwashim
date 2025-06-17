import { flushDBService } from "../services/flushDBService.js";

export const FlushDBController = {
  sendMobileOtp: async (req, res) => {
    try {
      const user = await flushDBService.sendMobileOtp();
      res.status(200).json({
        success: true,
        message: 'Mobile OTP sent',
        mobile: user.mob_no
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  verifyMobileOtp: async (req, res) => {
    try {
      const { mobile, otp } = req.body;
      if (!mobile || !otp) {
        return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
      }

      const result = flushDBService.verifyMobileOtp(mobile, otp);
      if (!result.success) return res.status(400).json(result);

      const user = await flushDBService.sendEmailOtp();

      res.status(200).json({
        success: true,
        message: 'Mobile OTP verified, Email OTP sent',
        email: user.email
      });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  verifyEmailOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
      }

      const result = flushDBService.verifyEmailOtp(email, otp);
      if (!result.success) return res.status(400).json(result);

      res.status(200).json({
        success: true,
        message: 'Email OTP verified successfully'
      });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  flushTable: async (req, res) => {
    try {
      const { tableName } = req.body;
      const result = await flushDBService.flushTable(tableName);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
