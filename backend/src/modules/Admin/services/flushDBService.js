import dotenv from "dotenv";
import { query } from "../../../../utils/database.js";
import { mobileOtpService } from './mobileOtpService.js';
import { emailOtpService } from './emailOtpService.js';
import { decryptDeterministic } from "../../../../utils/crypto.js";
dotenv.config();

export class FlushDBService {
  constructor() {
    this.verificationState = new Map();
  }
// ✅ Always fetch user with role_id = 101 and decrypt mob_no
  async getFirstUser() {
    const rows = await query(`SELECT * FROM users WHERE role_id = 101 ORDER BY id ASC LIMIT 1`);

    if (!rows || rows.length === 0) {
      throw new Error("No user found with role_id 101");
    }

    const user = rows[0];

    if (!user.mob_no) {
      throw new Error("Mobile number not found for selected user");
    }

    try {
      user.mob_no = decryptDeterministic(user.mob_no);
    } catch (err) {
      throw new Error("Error decrypting mobile number: " + err.message);
    }

    return user;
  }

  async flushTable(tableName) {
    const user = await this.getFirstUser();
    const state = this.verificationState.get(user.id);

    if (!state?.mobileVerified || !state?.emailVerified) {
      throw new Error("Both OTP verifications must be completed.");
    }

    try {
      if (tableName === "users") {
        // ✅ Get first user id with role_id = 101
        const [firstUser] = await query(`SELECT id FROM users WHERE role_id = 101 ORDER BY id ASC LIMIT 1`);
        const firstUserId = firstUser?.id || 0;

        // ❌ Delete all users except this id or any user with role_id = 101
        await query(`
          DELETE FROM users 
          WHERE id != ? 
          AND role_id != 101
        `, [firstUserId]);

        // ✅ Delete all login permissions except the first record
        const [firstLoginPer] = await query(`SELECT login_per_id FROM tbl_user_login_per ORDER BY login_per_id ASC LIMIT 1`);
        const firstLoginPerId = firstLoginPer?.login_per_id || 0;

        await query(`
          DELETE FROM tbl_user_login_per 
          WHERE login_per_id != ?
        `, [firstLoginPerId]);

      } else if (tableName === "tbl_attendance_records") {
        await query(`DELETE FROM tbl_attendance_records`);
      } else {
        throw new Error("Invalid table name");
      }

      // ✅ Clear OTP state
      this.verificationState.delete(user.id);

      return { message: `${tableName} flushed successfully.` };
    } catch (error) {
      throw new Error("Flush failed: " + error.message);
    }
  }


  // Send mobile OTP
  async sendMobileOtp() {
    const user = await this.getFirstUser();
    await mobileOtpService.sendOtp(user.mob_no);
    this.verificationState.set(user.id, { mobileVerified: false, emailVerified: false });
    return user;
  }

  // Verify mobile OTP
  verifyMobileOtp(mobile, otp) {
    const result = mobileOtpService.verifyOtp(mobile, otp);
    if (result.success) {
      const userId = Array.from(this.verificationState.keys())[0];
      const state = this.verificationState.get(userId);
      state.mobileVerified = true;
      this.verificationState.set(userId, state);
    }
    return result;
  }

  // Send email OTP
  async sendEmailOtp() {
    const user = await this.getFirstUser();
    await emailOtpService.sendOtp(user.email);
    return user;
  }

  // Verify email OTP
  verifyEmailOtp(email, otp) {
    const result = emailOtpService.verifyOtp(email, otp);
    if (result.success) {
      const userId = Array.from(this.verificationState.keys())[0];
      const state = this.verificationState.get(userId);
      state.emailVerified = true;
      this.verificationState.set(userId, state);
    }
    return result;
  }

 
}

export const flushDBService = new FlushDBService();
