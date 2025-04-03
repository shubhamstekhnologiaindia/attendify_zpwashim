import { query } from "../../../../utils/database.js"; 

import moment from "moment-timezone";
export const AttendanceService = {


    recordAttendance: async (user_id, inOutId, epochTime) => {
        try {
            await query("CALL MarkAttendance(?, ?, ?)", [user_id, inOutId, epochTime]);
 
            return {
                status: true,
                message: inOutId === 3 ? "Out time recorded successfully" : "In time recorded successfully"
            };
        } catch (error) {
            if (error.sqlState === '45000') {
                throw { status: false, message: error.sqlMessage };
            }
            throw { status: false, message: "Database error" };
        }
    },

    getUserAttendance: async (employee_id) => {
        try {
            if (!employee_id) {
                throw new Error("Employee ID is required");
            }
            const [attendanceRecords] = await query("CALL get_attendance_by_employee(?)", [employee_id]);

            return attendanceRecords.length ? attendanceRecords : [];
        } catch (error) {
            throw error;
        }
    },
    recordBulkAttendance: async (user_id, attendance) => {
        const { morning_in_time = null, afternoon_in_time = null, out_time = null } = attendance;
    
        try {
          // Call the stored procedure with the provided parameters
          await query("CALL MarkOfflineAttendance(?, ?, ?, ?)", [
            user_id,
            morning_in_time,
            afternoon_in_time,
            out_time
          ]);
    
          return {
            status: true,
            message: "Attendance recorded successfully"
          };
        } catch (error) {
          if (error.sqlState === '45000') {
            throw new Error(error.sqlMessage);
          }
          throw new Error("Database error");
        }
      },
};


