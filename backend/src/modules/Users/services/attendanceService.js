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
    
      // IST offset in seconds (UTC+5:30)
      const IST_OFFSET = 19800; // 5 hours * 3600 + 30 minutes * 60
      const SECONDS_IN_DAY = 86400;
    
      // Function to adjust epoch time for IST day
      const adjustEpochForIST = (epoch) => {
        if (epoch === null) return null;
        // Convert to IST by adding offset
        const istTime = epoch + IST_OFFSET;
        // Get IST midnight (start of IST day)
        const istMidnight = istTime - (istTime % SECONDS_IN_DAY);
        // Convert back to UTC (start of IST day in UTC)
        const utcMidnightForISTDay = istMidnight - IST_OFFSET;
        // Calculate original UTC midnight
        const utcMidnight = epoch - (epoch % SECONDS_IN_DAY);
        // If original epoch is before the IST day's UTC start, shift it forward
        if (epoch < utcMidnightForISTDay) {
          return epoch + SECONDS_IN_DAY;
        }
        // If after, shift it back (rare case, but for consistency)
        else if (epoch >= utcMidnightForISTDay + SECONDS_IN_DAY) {
          return epoch - SECONDS_IN_DAY;
        }
        return epoch; // Already in the correct day
      };
    
      // Adjust all epoch times
      const adjustedMorningInTime = adjustEpochForIST(morning_in_time);
      const adjustedAfternoonInTime = adjustEpochForIST(afternoon_in_time);
      const adjustedOutTime = adjustEpochForIST(out_time);
    
      try {
        await query("CALL MarkOfflineAttendance1(?, ?, ?, ?)", [
          user_id,
          adjustedMorningInTime,
          adjustedAfternoonInTime,
          adjustedOutTime,
        ]);
    
        return {
          status: true,
          message: "Attendance recorded successfully",
        };
      } catch (error) {
        if (error.sqlState === "45000") {
          throw new Error(error.sqlMessage);
        }
        throw new Error("Database error");
      }
    }}


