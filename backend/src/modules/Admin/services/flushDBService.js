import dotenv from "dotenv";
import { query } from "../../../../utils/database.js";
import { mobileOtpService } from './mobileOtpService.js';
import { emailOtpService } from './emailOtpService.js';
import { decryptDeterministic, decrypt} from "../../../../utils/crypto.js";
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

  if (!user.mob_no) throw new Error("Mobile number not found for selected user");
  if (!user.email) throw new Error("Email not found for selected user");

  try {
    user.mob_no = decryptDeterministic(user.mob_no);
    user.email = decrypt(user.email);// ✅ ADD THIS LINE
  } catch (err) {
    throw new Error("Error decrypting user data: " + err.message);
  }

  return user;
}

async flushTable(tableNames) {
  const user = await this.getFirstUser();
  const state = this.verificationState.get(user.id);

  if (!state?.mobileVerified || !state?.emailVerified) {
    return {
      status: 403,
      success: false,
      message: "Please verify both mobile and email OTPs before proceeding.",
    };
  }

  const tables = Array.isArray(tableNames) ? tableNames : [tableNames];

  const results = [];

  try {
    for (const tableName of tables) {
      if (tableName === "users") {
        const [firstUser] = await query(
          `SELECT id FROM users WHERE role_id = 101 ORDER BY id ASC LIMIT 1`
        );
        const firstUserId = firstUser?.id || 0;

        await query(
          `DELETE FROM users WHERE id != ? AND role_id != 101`,
          [firstUserId]
        );

        const [firstLoginPer] = await query(
          `SELECT login_per_id FROM tbl_user_login_per ORDER BY login_per_id ASC LIMIT 1`
        );
        const firstLoginPerId = firstLoginPer?.login_per_id || 0;

        await query(
          `DELETE FROM tbl_user_login_per WHERE login_per_id != ?`,
          [firstLoginPerId]
        );

        results.push(`users flushed`);
      } else if (tableName === "tbl_attendance_records") {
        await query(`DELETE FROM tbl_attendance_records`);
        results.push(`tbl_attendance_records flushed`);
      } else {
        results.push(`Invalid table: ${tableName}`);
      }
    }

    this.verificationState.delete(user.id);

    return {
      status: 200,
      success: true,
      message: results.join(", "),
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: `Flush failed: ${error.message}`,
    };
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
