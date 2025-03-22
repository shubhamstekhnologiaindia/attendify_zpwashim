import { query } from "../../../../utils/database.js"; // Import query function

export const recordAttendance = async (user_id, in_time, out_time, out_reason) => {
    try {
        // Execute the stored procedure
        await query("CALL record_attendance(?, ?, ?, ?)", [user_id, in_time, out_time, out_reason]);

        return {
            status: true,
            message: out_time ? "Out time recorded successfully" : "In time recorded successfully"
        };
    } catch (error) {
        console.error("Error executing procedure:", error);
        throw { status: false, message: "Database error" };
    }
};
