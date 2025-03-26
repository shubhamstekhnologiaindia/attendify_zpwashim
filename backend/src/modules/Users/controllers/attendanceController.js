import moment from "moment-timezone";
import { AttendanceService } from "../services/attendanceService.js"; 

import { getEpochTime } from "../../../../utils/epochTime.js";

export const AttendanceController = {

        recordAttendance: async (req, res) => {
          try {
            const { user_id, in_out_id } = req.body;
            
            // Validate required fields
            if (!user_id || !in_out_id) {
              return res.status(400).json({ status: false, message: "user_id and inOutId are required" });
            }
            
            // Generate current epoch time using your utility function
            const epochTime = getEpochTime(); // This should return the epoch time in the expected format
            
            // Call the service with the new parameters
            const result = await AttendanceService.recordAttendance(user_id, in_out_id, epochTime);
            
            return res.status(200).json(result);
          } catch (error) {
            console.error("Error:", error.message);
            return res.status(500).json({ status: false, message: "Internal server error" });
          }
        },
      

    CalculateAttendanceHours: async (req, res) => {
        try {
            const { user_id } = req.body; // ✅ Get user_id from body

            if (!user_id) {
                return res.status(400).json({ status: false, message: "user_id is required" });
            }

            // Call the service
            const records = await AttendanceService.calculateTotalHoursForDate(user_id);

            return res.status(200).json({ 
                status: true, 
                message: "Total working hours calculated successfully", 
                data: records 
            });

        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }
};
