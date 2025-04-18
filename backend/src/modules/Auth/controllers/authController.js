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
            return res.status(400).json({ message: "Mobile number and password are required" });
          }
      
          if (!fcm_token) {
            return res.status(400).json({ message: "FCM token is required for login" });
          }
      
          const encryptedMobNo = encryptDeterministic(mob_no);
      
          console.log("Login Encrypted Mobile Number:", encryptedMobNo);
      
          // Fetch user data
          const user = await query("SELECT * FROM users WHERE mob_no = ?", [
            encryptedMobNo,
          ]);

          console.log(user)
      
          if (user.length === 0) {
            return res
              .status(400)
              .json({ message: "Invalid mobile number or password" });
          }
      
          const userData = user[0];
      
          // Check if FCM token is already present for the user
          if (userData.fcm_token !== null) {
            return res.status(403).json({
              message: "You are already logged in on another device. Please log out first to proceed with login on this device.",
            });
          }else 
      
          // Validate status
          if (userData.status !== 1) {
            return res.status(403).json({
              message: "तुमचे प्रोफाइल सध्या मंजुरीसाठी प्रलंबित आहे. कृपया प्रशासकाशी संपर्क साधा.",
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
};
