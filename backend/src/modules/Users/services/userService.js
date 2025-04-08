import { query } from "../../../../utils/database.js"; 
import { decrypt, decryptDeterministic } from "../../../../utils/crypto.js"; 
// src/modules/user/services/UserService.js
import { encrypt, encryptDeterministic } from "../../../../utils/crypto.js";
import path from "path";

export const UserService = {
  getUserProfileById: async (id) => {
    const user = await query(
      "SELECT id, first_name, middle_name, last_name, mob_no, email,user_profile FROM users WHERE id = ?",
      [id]
    );

    if (user.length === 0) {
      return null;
    }

    return {
      id: user[0].id,
      first_name: decrypt(user[0].first_name),
      middle_name: user[0].middle_name ? decrypt(user[0].middle_name) : null,
      last_name: decrypt(user[0].last_name),
      mob_no: decryptDeterministic(user[0].mob_no), 
      email: user[0].email ? decrypt(user[0].email) : null,
      user_profile: user[0].user_profile ? `/` + user[0].user_profile.replace(/\\/g, "/") : null
    };
  },

  // updateUserProfile: async (userId, data, file) => {
  //   let user_profile = null;
  //   if (file) {
  //     user_profile = `uploads/user_profiles/${file.filename}`;
  //   }
  
  //   const {
  //     first_name,
  //     middle_name,
  //     last_name,
  //     email,
  //     birth_date // Added here
  //   } = data;
  
  //   const encryptedFirstName = first_name ? encrypt(first_name) : null;
  //   const encryptedMiddleName = middle_name ? encrypt(middle_name) : null;
  //   const encryptedLastName = last_name ? encrypt(last_name) : null;
  //   const encryptedEmail = email ? encrypt(email) : null;
  
  //   const sql = `
  //     UPDATE users
  //     SET
  //       first_name = COALESCE(?, first_name),
  //       middle_name = COALESCE(?, middle_name),
  //       last_name = COALESCE(?, last_name),
  //       email = COALESCE(?, email),
  //       user_profile = COALESCE(?, user_profile),
  //       birth_date = COALESCE(?, birth_date),
  //       updated_at = NOW()
  //     WHERE id = ?
  //   `;
  
  //   await query(sql, [
  //     encryptedFirstName,
  //     encryptedMiddleName,
  //     encryptedLastName,
  //     encryptedEmail,
  //     user_profile,
  //     birth_date || null,
  //     userId
  //   ]);
  // }
  updateUserProfile: async (userId, data, file) => {
    try {
      let user_profile = null;
      if (file) {
        // Normalize file path and store it correctly
        user_profile = `uploads/user_profiles/${path.basename(file.path)}`;
      }

      const {
        first_name,
        middle_name,
        last_name,
        email,
        birth_date
      } = data;

      // Encrypt fields if provided
      const encryptedFirstName = first_name ? encrypt(first_name) : null;
      const encryptedMiddleName = middle_name ? encrypt(middle_name) : null;
      const encryptedLastName = last_name ? encrypt(last_name) : null;
      const encryptedEmail = email ? encrypt(email) : null;

      const sql = `
        UPDATE users
        SET
          first_name = COALESCE(?, first_name),
          middle_name = COALESCE(?, middle_name),
          last_name = COALESCE(?, last_name),
          email = COALESCE(?, email),
          user_profile = COALESCE(?, user_profile),
          birth_date = COALESCE(?, birth_date),
          updated_at = NOW()
        WHERE id = ?
      `;

      await query(sql, [
        encryptedFirstName,
        encryptedMiddleName,
        encryptedLastName,
        encryptedEmail,
        user_profile,
        birth_date || null,
        userId
      ]);

    } catch (error) {
      console.error("Error updating user profile:", error.message);
      throw error;
    }
  }
};
