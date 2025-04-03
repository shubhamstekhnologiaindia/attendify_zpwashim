import { query } from "../../../../utils/database.js"; 
import { decrypt, decryptDeterministic } from "../../../../utils/crypto.js"; // Import decryption functions

export const UserService = {
  getUserProfileById: async (id) => {
    const user = await query(
      "SELECT id, first_name, middle_name, last_name, mob_no, email FROM users WHERE id = ?",
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
      mob_no: decryptDeterministic(user[0].mob_no), // Deterministic decryption for consistent lookup
      email: user[0].email ? decrypt(user[0].email) : null,
    };
  },
};
