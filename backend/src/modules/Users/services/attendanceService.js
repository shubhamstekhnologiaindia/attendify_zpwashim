import { query } from "../../../../utils/database.js"; // Import query function
import moment from "moment-timezone";
export const AttendanceService = {

      recordAttendance: async (user_id, inOutId, epochTime) => {
        try {
          // Execute the stored procedure sp_mark_attendance
          await query("CALL MarkAttendance(?, ?, ?)", [user_id, inOutId, epochTime]);
          
          // Return appropriate message based on inOutId
          return {
            status: true,
            message: inOutId === 3 ? "Out time recorded successfully" : "In time recorded successfully"
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

        // Call stored procedure
        const [result] = await query("CALL calculate_total_hours(?)", [user_id]);

        // Ensure result is an array
        if (!Array.isArray(result)) {
            throw new Error("Invalid response format from database");
        }

        // Format response
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