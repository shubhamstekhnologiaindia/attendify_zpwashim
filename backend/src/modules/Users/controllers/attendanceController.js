import moment from "moment-timezone";
import { recordAttendance } from "../services/attendanceService.js"; // Correct import

// Controller function to handle attendance API
export const handleAttendance = async (req, res) => {
    try {
        const { user_id, in_time, out_time, out_reason } = req.body;

        // Validate required fields
        if (!user_id || !in_time) {
            return res.status(400).json({ status: false, message: "user_id and in_time are required" });
        }

        // Validate date format
        if (!moment(in_time, moment.ISO_8601, true).isValid() || 
            (out_time && !moment(out_time, moment.ISO_8601, true).isValid())) {
            return res.status(400).json({ status: false, message: "Invalid date format" });
        }

        // Convert times to IST
        const istInTime = moment(in_time).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
        const istOutTime = out_time ? moment(out_time).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") : null;

        // Call service
        const result = await recordAttendance(user_id, istInTime, istOutTime, out_reason);
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};
