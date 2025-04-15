import moment from "moment-timezone";
import { AttendanceCountService } from "../services/attendanceCountService.js";
import { getEpochTime } from "../../../../utils/epochTime.js";



export const AttendanceCountController = {

    getUserHQCounts: async (req, res) => {
        try {
          // Call the service that fetches all location-based counts
          const counts = await AttendanceCountService.getUserCountsForHQ();
      
          // Respond with the data
          return res.status(200).json({
            success: true,
            message: "User attendance counts fetched successfully",
            data: counts
          });
      
        } catch (error) {
          // In case of error, return 500
          console.error("Error in getUserLocationCounts:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch user counts",
            error: error.message
          });
        }
      },

    getUserDistrictCounts: async (req, res) => {
        try {
          const counts = await AttendanceCountService.getUserCountsForDistrict();
      
          return res.status(200).json({
            success: true,
            message: "District user attendance counts fetched successfully",
            data: counts
          });
      
        } catch (error) {
          console.error("Error in getUserDistrictCounts:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch district user counts",
            error: error.message
          });
        }
      }
      
      
}