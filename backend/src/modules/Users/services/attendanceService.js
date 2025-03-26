import { query } from "../../../../utils/database.js"; 
import moment from "moment-timezone";
export const AttendanceService = {
 recordAttendance : async (user_id, in_time, out_time, out_reason) => {
    try {
       
        await query("CALL record_attendance(?, ?, ?, ?)", [user_id, in_time, out_time, out_reason]);

        return {
            status: true,
            message: out_time ? "Out time recorded successfully" : "In time recorded successfully"
        };
    } catch (error) {
        console.error("Error executing procedure:", error);
        throw { status: false, message: "Database error" };
    }
},
  calculateTotalHoursForDate: async (user_id) => {
    try {
        if (!user_id) {
            throw new Error("user_id is required");
        }
        const [result] = await query("CALL calculate_total_hours(?)", [user_id]);
        if (!Array.isArray(result)) {
            throw new Error("Invalid response format from database");
        }
        return result.map(row => ({
            date: moment(row.date).format("YYYY-MM-DD"),
            total_duration: row.total_duration ? row.total_duration.substring(0, 5) : "00:00",
            records: row.records ? JSON.parse(row.records) : []
        }));

    } catch (error) {
        console.error("Error calculating total hours:", error);
        throw error;
    }
}
};