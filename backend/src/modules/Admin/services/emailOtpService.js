import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export class EmailOtpService {
  constructor() {
    this.otpStore = new Map();
  }

  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email) {
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email address');
    }

    const otp = this.generateOtp();
    this.otpStore.set(email, { otp, timestamp: Date.now() });


      // ⚠️ Debug: log OTP
  console.log(`🔐 [Email OTP] For ${email}: ${otp}`);

  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"ZP Washim" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
      html: `<p>Your OTP is: <b>${otp}</b>. It is valid for <b>5 minutes</b>.</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      throw new Error('Email sending failed: ' + err.message);
    }
  }

  verifyOtp(email, otp) {
    const data = this.otpStore.get(email);
    if (!data) {
      return { success: false, message: 'OTP not found or expired' };
    }

    const diff = (Date.now() - data.timestamp) / (1000 * 60);
    if (diff > 5) {
      this.otpStore.delete(email);
      return { success: false, message: 'OTP expired' };
    }

    if (data.otp === otp) {
      this.otpStore.delete(email);
      return { success: true, message: 'Email OTP verified' };
    }

    return { success: false, message: 'Invalid OTP' };
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const emailOtpService = new EmailOtpService();
