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

    recordOfflineAttendance: async (user_id, attendance) => {
      
        const { morning_in_time = null, afternoon_in_time = null, out_time = null } = attendance;
      
    
        if (morning_in_time !== null && typeof morning_in_time !== 'number') {
          throw new Error("morning_in_time must be a number");
        }
        if (afternoon_in_time !== null && typeof afternoon_in_time !== 'number') {
          throw new Error("afternoon_in_time must be a number");
        }
        if (out_time !== null && typeof out_time !== 'number') {
          throw new Error("out_time must be a number");
        }
      
        try {
          await query("CALL MarkOfflineAttendance1(?, ?, ?, ?)", [
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
      }
    }


