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
  login: async (req, res) => {
    try {
      const { mob_no, password, fcm_token } = req.body;

      // Validate required fields
      if (!mob_no || !password) {
        return res
          .status(400)
          .json({ message: "Mobile number and password are required" });
      }

      // if (!fcm_token) {
      //   return res.status(400).json({ message: "FCM token is required for login" });
      // }

      const encryptedMobNo = encryptDeterministic(mob_no);

      console.log("Login Encrypted Mobile Number:", encryptedMobNo);

      const user = await query("SELECT * FROM users WHERE mob_no = ?", [
        encryptedMobNo,
      ]);

      console.log(user);

      if (user.length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid mobile number or password" });
      }

      const userData = user[0];

      console.log(userData);

      // Check if FCM token is already present for the user
      if (userData.fcm_token !== null) {
        return res.status(403).json({
          message:
            "You are already logged in on another device. Please log out first to proceed with login on this device.",
        });
      }

      // Validate status
      if (userData.status !== 1) {
        return res.status(403).json({
          message:
            "तुमचे प्रोफाइल सध्या मंजुरीसाठी प्रलंबित आहे. कृपया प्रशासकाशी संपर्क साधा.",
        });
      }

      // Compare hashed password
      const isPasswordMatch = await bcrypt.compare(password, userData.password);
      if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid Password" });
      }

      // Update FCM token since it is null

      await query("UPDATE users SET fcm_token = ? WHERE id = ?", [
        fcm_token,
        userData.id,
      ]);

      // Decrypt name fields
      const firstName = decrypt(userData.first_name);
      const lastName = decrypt(userData.last_name);

      const fullName = `${firstName} ${lastName}`;

      // Generate JWT token with decrypted data
      const token = jwt.sign(
        {
          id: userData.id,
          role_id: userData.role_id,
          username: fullName,
          department_id: userData.department_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

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

  // webLogin: async (req, res) => {
  //   try {
  //     const { mob_no, password } = req.body;

  //     // Validate required fields
  //     if (!mob_no || !password) {
  //       return res.status(400).json({
  //         status: false,
  //         message: "Mobile number and password are required",
  //       });
  //     }

  //     // Encrypt mobile number
  //     const encryptedMobNo = encryptDeterministic(mob_no);

  //     // Check if user exists and is active
  //     const userSql = `
  //       SELECT id, first_name, last_name, password, role_id, department_id
  //       FROM users
  //       WHERE mob_no = ? AND status = 1
  //       LIMIT 1
  //     `;
  //     const users = await query(userSql, [encryptedMobNo]);

  //     if (users.length === 0) {
  //       return res.status(401).json({
  //         status: false,
  //         message: "Invalid mobile number or password",
  //       });
  //     }

  //     const user = users[0];

  //     // Verify password
  //     const isPasswordValid = await bcrypt.compare(password, user.password);
  //     if (!isPasswordValid) {
  //       return res.status(401).json({
  //         status: false,
  //         message: "Invalid mobile number or password",
  //       });
  //     }

  //     // Check permission in tbl_salary_slip_per
  //     const permissionSql = `
  //       SELECT salary_slip_per_id
  //       FROM tbl_salary_slip_per
  //       WHERE salary_slip_per_userid = ? AND permission_status = 1
  //       LIMIT 1
  //     `;
  //     const permissions = await query(permissionSql, [user.id]);

  //     if (permissions.length === 0) {
  //       return res.status(403).json({
  //         status: false,
  //         message:
  //           "This user does not have permission to log in. Please get approval from headquarters.",
  //       });
  //     }

  //     // Decrypt name fields
  //     const firstName = decrypt(user.first_name);
  //     const lastName = decrypt(user.last_name);
  //     const fullName = `${firstName} ${lastName}`;

  //     // Generate JWT token
  //     const token = jwt.sign(
  //       {
  //         id: user.id,
  //         role_id: user.role_id,
  //         username: fullName,
  //         department_id: user.department_id,
  //       },
  //       process.env.JWT_SECRET,
  //       { expiresIn: "7d" }
  //     );

  //     // Return success response
  //     return res.status(200).json({
  //       status: true,
  //       message: "Login successful",
  //       token,
  //     });
  //   } catch (error) {
  //     console.error("Error in webLogin controller:", error);
  //     return res.status(500).json({
  //       status: false,
  //       message: "Failed to process login request",
  //     });
  //   }
  // },


webLogin: async (req, res) => {
  try {
    const { mob_no, password } = req.body;
    if (!mob_no || !password) {
      return res.status(400).json({
        status: false,
        message: "Mobile number and password are required",
      });
    }

    const encryptedMobNo = encryptDeterministic(mob_no);

    console.log(encryptedMobNo)

    // 1) Fetch user (including their cader_id)
    const userSql = `
      SELECT id, first_name, last_name, password, role_id,
             department_id, cader_id
      FROM users
      WHERE mob_no = ? AND status = 1
      LIMIT 1
    `;
    const users = await query(userSql, [encryptedMobNo]);
    if (users.length === 0) {
      return res.status(401).json({
        status: false,
        message: "Invalid mobile number or password",
      });
    }
    const user = users[0];

    // 2) Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: "Invalid mobile number or password",
      });
    }

    // 3) Call our SP to get both flags in one go
    const spSql = `CALL CheckUsersAuthority(?, ?);`;
    // mysql2’s .execute / .query on a CALL returns an array of result‐sets
    const [ spResultSets ] = await query(spSql, [user.cader_id, user.id]);
    // The first SELECT inside the proc comes back as spResultSets[0]

    const { isThisOfficer, isThisSalaryhead } = spResultSets[0];

    // 4) If *both* flags are false → no login
    if (!isThisOfficer && !isThisSalaryhead) {
      return res.status(403).json({
        status: false,
        message:
          "This user does not have permission to log in. Please get approval from headquarters.",
      });
    }

    // 5) Otherwise proceed as before
    const firstName = decrypt(user.first_name);
    const lastName  = decrypt(user.last_name);
    const fullName  = `${firstName} ${lastName}`;

    const token = jwt.sign(
      {
        id:            user.id,
        role_id:       user.role_id,
        username:      fullName,
        department_id: user.department_id,
        isThisOfficer:isThisOfficer,
        isThisSalaryhead:isThisSalaryhead

      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      status:  true,
      message: "Login successful",
      token
    });
  } catch (error) {
    console.error("Error in webLogin controller:", error);
    return res.status(500).json({
      status:  false,
      message: "Failed to process login request",
    });
  }
},


  logout: async (req, res) => {
    try {
      const { user_id } = req.body;

      // 1) Validate required field
      if (!user_id) {
        return res
          .status(400)
          .json({ status: false, message: "user_id is required" });
      }

      // 2) Clear the FCM token
      const result = await query(
        "UPDATE users SET fcm_token = NULL, updated_at = NOW() WHERE id = ?",
        [user_id]
      );

      // 3) Check that a row was actually updated
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({
            status: false,
            message: "User not found or already logged out",
          });
      }

      // 4) Return success
      return res
        .status(200)
        .json({ status: true, message: "Logout successful" });
    } catch (error) {
      console.error("Logout Error:", error);
      return res.status(500).json({
        status: false,
        message: "Error during logout",
        error: error.message,
      });
    }
  },
};
