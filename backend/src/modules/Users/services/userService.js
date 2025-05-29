import { query } from "../../../../utils/database.js"; 
import { decrypt, decryptDeterministic,encrypt,encryptDeterministic } from "../../../../utils/crypto.js"; 
import axios from "axios";
import bcrypt from 'bcrypt';
import path from "path";

import { BlobServiceClient } from "@azure/storage-blob";

  // Mapping of dept_id to cader_id for role_id = 102
  const SPECIAL_CADER_ROLES = {
    1: 2,
    2: 25,
    3: 36,
    4: 43,
    5: 55,
    6: 67,
    7: 80,
    8: 94,
    9: 102,
    10: 115,
    11: 134,
    12: 148,
    13: 157,
    14: 172
  };
export const UserService = {

  RegisterUser: async (userData) => {
    try {
        const {
            first_name, middle_name, last_name,
            mob_no, email, birth_date, joining_date, department_id,
            office_location_id, taluka_id, village_id,
            cader_id, password, role_id, device_id
        } = userData;

        // Check if user exists with encrypted deterministic mobile number
        const encryptedMobNo = encryptDeterministic(mob_no);
        const checkUserSql = `SELECT * FROM users WHERE mob_no = ? LIMIT 1`;
        const existingUser = await query(checkUserSql, [encryptedMobNo]);

        if (existingUser.length > 0) {
            return { alreadyExists: true };
        }

        // Determine role_id based on dept_id and cader_id
        let finalRoleId = role_id || 0; // Default to 0 if role_id is not provided
        if (department_id && cader_id && SPECIAL_CADER_ROLES[department_id] === parseInt(cader_id)) {
            finalRoleId = 102;
        }

        // Continue registration
        const sql = `CALL RegisterUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const hashedPassword = await bcrypt.hash(password, 10);

        const results = await query(sql, [
            encrypt(first_name),
            encrypt(middle_name),
            encrypt(last_name),
            encryptedMobNo,
            encrypt(email),
            birth_date,
            joining_date,
            department_id,
            office_location_id,
            taluka_id,
            village_id,
            cader_id,
            hashedPassword,
            finalRoleId,
            device_id || null
        ]);

        return { success: true, data: results };
    } catch (error) {
        console.error("Error in RegisterUser service:", error);
        throw new Error("Failed to register user");
    }
},



 
getUserProfileById: async (id) => {
    const user = await query(
    `SELECT 
      u.id, 
      u.first_name, 
      u.middle_name, 
      u.last_name, 
      u.mob_no, 
      u.email, 
      u.user_profile, 
      u.cader_id,
      c.cader_name AS cader_name, 
      DATE_FORMAT(u.birth_date, '%Y-%m-%d') AS birth_date 
    FROM users u
    LEFT JOIN tbl_cader c ON u.cader_id = c.id
    WHERE u.id = ?`,
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
    birth_date: user[0].birth_date ,
    user_profile: user[0].user_profile,
    cader_name: user[0].cader_name || null

  }
},


// updateUserProfile: async (userId, data, file) => {
//   try {
//     let user_profile = null;
//     if (file) {
//       // Normalize file path and store it correctly
//       user_profile = `uploads/user_profiles/${path.basename(file.path)}`;
//     }

//     const {
//       first_name,
//       middle_name,
//       last_name,
//       email,
//       birth_date
//     } = data;

//     // Encrypt fields if provided
//     const encryptedFirstName = first_name ? encrypt(first_name) : null;
//     const encryptedMiddleName = middle_name ? encrypt(middle_name) : null;
//     const encryptedLastName = last_name ? encrypt(last_name) : null;
//     const encryptedEmail = email ? encrypt(email) : null;

//     const sql = `
//       UPDATE users
//       SET
//         first_name = COALESCE(?, first_name),
//         middle_name = COALESCE(?, middle_name),
//         last_name = COALESCE(?, last_name),
//         email = COALESCE(?, email),
//         user_profile = COALESCE(?, user_profile),
//         birth_date = COALESCE(?, birth_date),
//         updated_at = NOW()
//       WHERE id = ?
//     `;

//     await query(sql, [
//       encryptedFirstName,
//       encryptedMiddleName,
//       encryptedLastName,
//       encryptedEmail,
//       user_profile,
//       birth_date || null,
//       userId
//     ]);
//     console.log("SQL values:", {
//       encryptedFirstName,
//       encryptedMiddleName,
//       encryptedLastName,
//       encryptedEmail,
//       user_profile,
//       birth_date,
//       userId
//     });
    
//   } catch (error) {
//     console.error("Error updating user profile:", error.message);
//     throw error;
//   }
// },




updateUserProfile: async (userId, data) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      birth_date,
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
        birth_date = COALESCE(?, birth_date),
        updated_at = NOW()
      WHERE id = ?
    `;

    await query(sql, [
      encryptedFirstName,
      encryptedMiddleName,
      encryptedLastName,
      encryptedEmail,
      birth_date || null,
      userId
    ]);
    console.log("SQL values:", {
      encryptedFirstName,
      encryptedMiddleName,
      encryptedLastName,
      encryptedEmail,
      birth_date,
      userId
    });

  } catch (error) {
    console.error("Error updating user profile:", error.message);
    throw error;
  }
},

  uploadProfilePicture: async (userId, file_upload) => {
    const connStr   = (process.env.AZURE_STORAGE_CONNECTION_STRING || "").trim();
    const container = (process.env.CONTAINER_NAME || "").trim();
    if (!connStr)   throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING");
    if (!container) throw new Error("Missing CONTAINER_NAME");

    const blobSvc = BlobServiceClient.fromConnectionString(connStr);
    const contCli = blobSvc.getContainerClient(container);
    await contCli.createIfNotExists({ access: "blob" });

    // 1️⃣ Get old URL
    const rows = await query(
      "SELECT user_profile FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    if (rows.length === 0) throw new Error("User not found");
    const oldUrl     = rows[0].user_profile;
    const isFirstTime = !oldUrl;

    // 2️⃣ Delete old blob
    if (oldUrl) {
      const oldBlobName = oldUrl.split("/").slice(-2).join("/");
      await contCli.getBlockBlobClient(oldBlobName).deleteIfExists();
    }

    // 3️⃣ Upload new file from disk
    const blobName = `profiles/${userId}/${Date.now()}-${file_upload.originalname}`;
    const blockCli = contCli.getBlockBlobClient(blobName);
    // ← here’s the change:
    await blockCli.uploadFile(file_upload.path);

    const newUrl = blockCli.url;

    // 4️⃣ Update DB
    await query(
      "UPDATE users SET user_profile = ?, updated_at = NOW() WHERE id = ?",
      [newUrl, userId]
    );

    // 5️⃣ (Optional) Remove the local file if you don't need to keep it
    try { fs.unlinkSync(file_upload.path); } catch {}

    return { newUrl, isFirstTime };
  },



SendOtp: async (phoneNumber, otp) => {
   
    try {
        const apiUrl = 'http://bulksms.saakshisoftware.com/api/mt/SendSMS';

        const params = {
            user: 'Tekhnologia',
            password: 'Tech%40123%23',
            senderid: 'SNILKT',
            channel: 'Trans',
            DCS: '04',
            flashsms: '0',
            number: phoneNumber,
            text: `आपला ओटीपी क्रमांक आहे: ${otp} कृपया हा ओटीपी पुढील प्रक्रियेसाठी वापरा. - झेडपी वाशिम SHRI NILKANTHESHWAR`,
            route: '04',
            DLTTemplateId: '1707174402037894471',
            PEID: '1701172491385434035'
        };

        const response = await axios.get(apiUrl, { params });
      

        if (response.status === 200) {
            return response.data; // Return the response data if needed
        } else {
            throw new Error("Failed to send OTP");
        }
    } catch (error) {
        console.error("Error in SendOtp service:", error);
        throw new Error("Failed to send OTP");
    }
}
};
