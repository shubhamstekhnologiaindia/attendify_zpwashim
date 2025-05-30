import moment from "moment-timezone";
import { UserService } from "../services/userService.js";
import { getEpochTime } from "../../../../utils/epochTime.js";
import axios from "axios";
import { encrypt, encryptDeterministic } from "../../../../utils/crypto.js";
import fs from "fs";
import path from "path";
import multer from "multer";


export const UserController = {

  RegisterUser: async (req, res) => {
    try {
        const {
            first_name, middle_name, last_name,
            mob_no, email, birth_date, joining_date, department_id,
            office_location_id, taluka_id, village_id,
            cader_id, password
        } = req.body;

        // List of mandatory fields
        const requiredFields = {
            first_name,
            middle_name,
            last_name,
            mob_no,
            email,
            birth_date,
            department_id,
            office_location_id,
            taluka_id,
            village_id,
            cader_id,
            joining_date,
            password
        };

        // Check for missing or undefined/null fields
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => value === undefined || value === null || value === "")
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                status: false,
                message: `Missing mandatory fields: ${missingFields.join(", ")}`
            });
        }

        const result = await UserService.RegisterUser(req.body);

        if (result.alreadyExists) {
            return res.status(409).json({
                status: false,
                message: "User already exists with this mobile number"
            });
        }

        return res.status(201).json({
            status: true,
            message: "User registered successfully"
        });
    } catch (error) {
        console.error("Error in RegisterUser controller:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to register user"
        });
    }
},
     
getUserProfile: async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserProfileById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
},

updateUserProfile: async (req, res) => {
  try {
    const userId = req.params.id;
    await UserService.updateUserProfile(userId, req.body, req.file);

    res.status(200).json({ success: true, message: "User profile updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
},

  uploadProfilePicture: async (req, res) => {
    try {
      const userId      = req.params.id;
      const file_upload = req.file;  // multer put it here

      if (!file_upload) {
        return res
          .status(400)
          .json({ success: false, message: "No file provided under ‘user_profile’" });
      }

      const { newUrl, isFirstTime } =
        await UserService.uploadProfilePicture(userId, file_upload);

      return res.status(200).json({
        success: true,
        message: isFirstTime
          ? "Profile picture added successfully"
          : "Profile picture updated successfully",
        url: newUrl
      });
    } catch (err) {
      console.error("Error in uploadProfilePicture controller:", err);
      return res
        .status(500)
        .json({ success: false, message: "Upload failed" });
    }
  },

SendOtp: async (req, res) => {
      try {
          const { phoneNumber, otp } = req.body; 

          const result = await UserService.SendOtp(phoneNumber, otp);

          return res.status(200).json({
              status: true,
              message: "OTP sent successfully",
              data: result
          });
      } catch (error) {
          console.error("Error in SendOtp controller:", error);
          return res.status(500).json({
              status: false,
              message: "Failed to send OTP"
          });
      }
  }
  }

