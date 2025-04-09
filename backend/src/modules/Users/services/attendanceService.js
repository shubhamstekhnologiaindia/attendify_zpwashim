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
      const {
        morning_in_time = null,
        afternoon_in_time = null,
        out_time = null
      } = attendance;
  
      // 1) Type validation
      if (morning_in_time !== null && typeof morning_in_time !== 'number') {
        throw new Error('morning_in_time must be a number or null');
      }
      if (afternoon_in_time !== null && typeof afternoon_in_time !== 'number') {
        throw new Error('afternoon_in_time must be a number or null');
      }
      if (out_time !== null && typeof out_time !== 'number') {
        throw new Error('out_time must be a number or null');
      }
  
      // 2) Adjust each epoch for IST‐day
      const adjMorning   = convertEpochToIST(morning_in_time);
      const adjAfternoon = adjustEpochForIST(afternoon_in_time);
      const adjOut       = adjustEpochForIST(out_time);

      console.log(adjMorning)
      
      console.log(adjAfternoon)
      
      console.log(adjOut)
  
      // 3) Call your stored procedure
      try {
        await query(
          'CALL MarkofflineAttendance1(?, ?, ?, ?)',
          [user_id, adjMorning, adjAfternoon, adjOut]
        );
        return { status: true, message: 'Attendance recorded successfully' };
      } catch (err) {
        if (err.sqlState === '45000') {
          // SP signaled a business error
          throw new Error(err.sqlMessage);
        }
        console.error(err);
        throw new Error('Database error');
      }
    }
    }


