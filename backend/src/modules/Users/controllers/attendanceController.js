import moment from "moment-timezone";
import { AttendanceService } from "../services/attendanceService.js";
import {query} from "../../../../utils/database.js";

export const AttendanceController = {
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