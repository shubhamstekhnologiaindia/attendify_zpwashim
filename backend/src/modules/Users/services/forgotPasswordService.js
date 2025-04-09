import { query } from "../../../../utils/database.js"; 
import { decrypt, decryptDeterministic, encrypt, encryptDeterministic } from "../../../../utils/crypto.js"; 
import bcrypt from "bcrypt"; // Also make sure bcrypt is imported

export const ForgotPasswordService = {
  resetPasswordByMobile: async (mob_no, newPassword) => {
    try {
      // Encrypt the input mobile number using deterministic encryption
      const encryptedMobNo = encryptDeterministic(mob_no);

      // Query the user with encrypted mobile number
      const users = await query('SELECT id FROM users WHERE mob_no = ?', [encryptedMobNo]);

      if (!users || users.length === 0) {
        return { success: false, message: 'Mobile number does not exist' };
      }

      const userId = users[0].id;

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password
      await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

      return { success: true };
    } catch (err) {
      console.error('Reset Password Error:', err);
      throw err;
    }
  }
};
