import moment from "moment-timezone";
import { AttendanceService } from "../services/attendanceService.js"; 

export const AttendanceController = {

    recordAttendance: async (req, res) => {
    try {
        const { user_id, in_time, out_time, out_reason } = req.body;

        if (!user_id || !in_time) {
            return res.status(400).json({ status: false, message: "user_id and in_time are required" });
        }

        if (!moment(in_time, moment.ISO_8601, true).isValid() || 
            (out_time && !moment(out_time, moment.ISO_8601, true).isValid())) {
            return res.status(400).json({ status: false, message: "Invalid date format" });
        }

        const istInTime = moment(in_time).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
        const istOutTime = out_time ? moment(out_time).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") : null;

        const result = await recordAttendance(user_id, istInTime, istOutTime, out_reason);
        
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
