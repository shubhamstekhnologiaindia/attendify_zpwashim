import moment from "moment-timezone";
import { UserService } from "../services/userService.js";
import { getEpochTime } from "../../../../utils/epochTime.js";
import { encrypt, encryptDeterministic } from "../../../../utils/crypto.js";
import fs from "fs";
import path from "path";
import multer from "multer";


export const UserController = {
    
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
    }


  }; 