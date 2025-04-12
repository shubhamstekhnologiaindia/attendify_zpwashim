import { query } from "../../../../utils/database.js"; 



import moment from "moment-timezone";

function adjustEpochForIST(epoch) {
  if (epoch === null) return null;
  const IST_OFFSET = 5.5 * 3600;      // 19800 seconds
  const SECONDS_IN_DAY = 86400;

  // Shift into IST
  const istTime = epoch + IST_OFFSET;
  // Find IST‐midnight epoch
  const istMidnight = istTime - (istTime % SECONDS_IN_DAY);
  // Convert back to UTC epoch for that IST‐midnight
  const utcMidnightForIST = istMidnight - IST_OFFSET;

  // If original epoch is before that UTC‐midnight, it belongs to the *previous* IST day
  if (epoch < utcMidnightForIST) return epoch + SECONDS_IN_DAY;
  // If it’s past the next IST day boundary, shift back
  if (epoch >= utcMidnightForIST + SECONDS_IN_DAY) return epoch - SECONDS_IN_DAY;
  return epoch;
}

function convertEpochToIST(epoch) {
  if (epoch === null) return null;
  const IST_OFFSET = 5.5 * 3600; // 19800 seconds
  return epoch + IST_OFFSET;
}



export const AttendanceService = {


  recordAttendance: async (user_id, inOutId, istTime) => {
    try {
      console.log(istTime); // Log the IST time for debugging

      await query("CALL MarkAttendance(?, ?, ?)", [user_id, inOutId, istTime]);

      return {
        status: true,
        message: inOutId === 3 ? "Out time recorded successfully" : "In time recorded successfully",
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

            console.log(attendanceRecords)

            return attendanceRecords
        } catch (error) {
            throw error;
        }
    },

  

    recordOfflineAttendance: async (user_id, morning_in_time, afternoon_in_time, out_time) => {
      try {
      
        const insertQuery = `CALL MarkOfflineAttendance(?, ?, ?, ?)`;
        const result = await query(insertQuery, [
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


    }
