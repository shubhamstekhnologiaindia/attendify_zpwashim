import moment from "moment-timezone";
import { UserService } from "../services/userService.js";
import { getEpochTime } from "../../../../utils/epochTime.js";


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
  };