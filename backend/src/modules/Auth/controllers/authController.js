import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../../../../utils/database.js";
import dotenv from "dotenv";
import {
  encrypt,
  decrypt,
  encryptDeterministic,
  decryptDeterministic,
} from "../../../../utils/crypto.js";

dotenv.config();

export const AuthController = {
//   register: async (req, res) => {
//     try {
//       const {
//         first_name,
//         middle_name,
//         last_name,
//         mob_no,
//         birth_date,
//         email,
//         department_id,
//         office_location_id,
//         taluka_id,
//         village_id,
//         cader_id,
//         password,
//         role_id,
//         device_id,
//       } = req.body;

//       // Encrypt mob_no deterministically for consistent lookup
//       const encryptedMobNo = encryptDeterministic(mob_no);
//       if (!encryptedMobNo) {
//         return res.status(400).json({ message: "Invalid mobile number" });
//       }

//       // Check for existing user
//       const existingUser = await query(
//         "SELECT id FROM users WHERE mob_no = ?",
//         [encryptedMobNo]
//       );

//       if (existingUser.length > 0) {
//         return res.status(400).json({
//           message: "User already exists with this mobile number",
//         });
//       }

//       // Hash the password
//       const hashedPassword = await bcrypt.hash(password, 8);

//       // Encrypt other fields with random IV
//       const encryptedData = {
//         first_name: encrypt(first_name),
//         middle_name: middle_name ? encrypt(middle_name) : null,
//         last_name: encrypt(last_name),
//         mob_no: encryptedMobNo, // Deterministic encryption
//         email: email ? encrypt(email) : null,
//       };

//       // Insert user into the database
//       const result = await query(
//         "INSERT INTO users (first_name, middle_name, last_name, mob_no, email, department_id, office_location_id, taluka_id, village_id, cader_id, password, role_id, device_id,birth_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, NOW())",
//         [
//           encryptedData.first_name,
//           encryptedData.middle_name,
//           encryptedData.last_name,
//           encryptedData.mob_no,
//           encryptedData.email,
//           department_id,
//           office_location_id,
//           taluka_id,
//           village_id,
//           cader_id,
//           hashedPassword,
//           role_id,
//           device_id,
//           birth_date
//         ]
//       );

//       if (result.affectedRows > 0) {
//         return res
//           .status(201)
//           .json({ message: "User registered successfully" });
//       } else {
//         return res.status(400).json({ message: "Failed to register user" });
//       }
//     } catch (err) {
//       console.error("Registration Error:", err.message);
//       return res.status(500).json({
//         message: "Error registering user",
//         error: err.message,
//       });
//     }
//   },

//   login: async (req, res) => {
//     try {
//       const { mob_no, password, fcm_token } = req.body; // Accept FCM token from request

//       // Encrypt mob_no deterministically for lookup
//       const encryptedMobNo = encryptDeterministic(mob_no);
//       if (!encryptedMobNo) {
//         return res.status(400).json({ message: "Invalid mobile number" });
//       }
// console.log("Login Encrypted Mobile Number:", encryptedMobNo);
//       // Fetch user based on encrypted mobile number
//       const user = await query("SELECT * FROM users WHERE mob_no = ?", [
//         encryptedMobNo,
//       ]);

//       if (user.length === 0) {
//         return res
//           .status(400)
//           .json({ message: "Invalid mobile number or password" });
//       }

//       const userData = user[0];

      
//       // Check user status
//       // if (userData.status !== 1) {
//       //   return res.status(403).json({ 
//       //     message: "तुमचे प्रोफाइल सध्या मंजुरीसाठी प्रलंबित आहे. कृपया मंजुरीसाठी तुमच्या प्रशासक किंवा वरिष्ठ अधिकाऱ्याशी संपर्क साधा. तुमच्या संयमाबद्दल धन्यवाद !" 
//       //   });
//       // }

//       // Compare password
//       const isPasswordMatch = await bcrypt.compare(password, userData.password);
//       if (!isPasswordMatch) {
//         return res
//           .status(400)
//           .json({ message: "Invalid mobile number or password" });
//       }

//       // Update FCM token in database
//       if (fcm_token) {
//         await query("UPDATE users SET fcm_token = ? WHERE id = ?", [
//           fcm_token,
//           userData.id,
//         ]);
//       }

//       // Generate JWT token
//       const token = jwt.sign(
//         { id: userData.id, role_id: userData.role_id },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//       );

//       return res.status(200).json({
//         message: "Login successful",
//         token,
//       });
//     } catch (err) {
//       console.error("Login Error:", err.message);
//       return res.status(500).json({
//         message: "Error logging in",
//         error: err.message,
//       });
//     }
//   },



login: async (req, res) => {
  try {
      const { mob_no, password, fcm_token } = req.body;

      const encryptedMobNo = encryptDeterministic(mob_no);
      if (!encryptedMobNo) {
          return res.status(400).json({ message: "Invalid mobile number" });
      }

      console.log("Login Encrypted Mobile Number:", encryptedMobNo);

      const user = await query("SELECT * FROM users WHERE mob_no = ?", [
          encryptedMobNo,
      ]);

      if (user.length === 0) {
          return res
              .status(400)
              .json({ message: "Invalid mobile number or password" });
      }

      const userData = user[0];

      // console.log("User Data:", userData.status !== '1');
      // ✅ Validate status
      if (userData.status !== '1') {
          return res.status(403).json({
              message: "तुमचे प्रोफाइल सध्या मंजुरीसाठी प्रलंबित आहे. कृपया प्रशासकाशी संपर्क साधा.",
          });
      }

      // ✅ Compare hashed password
      const isPasswordMatch = await bcrypt.compare(password, userData.password);
      if (!isPasswordMatch) {
          return res
              .status(400)
              .json({ message: "Invalid mobile number or password" });
      }

      // ✅ Update FCM token if present
      if (fcm_token) {
          await query("UPDATE users SET fcm_token = ? WHERE id = ?", [
              fcm_token,
              userData.id,
          ]);
      }

       // ✅ Decrypt name fields
    const middleName = decrypt(userData.middle_name);
    const lastName = decrypt(userData.last_name);

    const fullName = `${middleName} ${lastName}`;

    // ✅ JWT token with decrypted data
    const token = jwt.sign(
      {
        id: userData.id,
        role_id: userData.role_id,
        username: fullName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    //   // ✅ JWT token
    //   const token = jwt.sign(
    //       { id: userData.id, role_id: userData.role_id },
    //       process.env.JWT_SECRET,
    //       { expiresIn: "7d" }
    //   );

      return res.status(200).json({
          message: "Login successful",
          token,
      });

  } catch (err) {
      console.error("Login Error:", err.message);
      return res.status(500).json({
          message: "Error logging in",
          error: err.message,
      });
  }
},
};
