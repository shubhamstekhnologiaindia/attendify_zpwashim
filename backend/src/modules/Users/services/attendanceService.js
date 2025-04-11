import { query } from "../../../../utils/database.js";

import moment from "moment-timezone";

function adjustEpochForIST(epoch) {
  if (epoch === null) return null;
  const IST_OFFSET = 5.5 * 3600; // 19800 seconds
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
  if (epoch >= utcMidnightForIST + SECONDS_IN_DAY)
    return epoch - SECONDS_IN_DAY;
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
        message:
          inOutId === 3
            ? "Out time recorded successfully"
            : "In time recorded successfully",
      };
    } catch (error) {
      if (error.sqlState === "45000") {
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
      const [attendanceRecords] = await query(
        "CALL get_attendance_by_employee(?)",
        [employee_id]
      );

            console.log(attendanceRecords)

            return attendanceRecords
        } catch (error) {
            throw error;
        }
    },

  // recordOfflineAttendance: async (user_id, attendance) => {
  //   const {
  //     morning_in_time = null,
  //     afternoon_in_time = null,
  //     out_time = null
  //   } = attendance;

  //   // 1) Type validation
  //   if (morning_in_time !== null && typeof morning_in_time !== 'number') {
  //     throw new Error('morning_in_time must be a number or null');
  //   }
  //   if (afternoon_in_time !== null && typeof afternoon_in_time !== 'number') {
  //     throw new Error('afternoon_in_time must be a number or null');
  //   }
  //   if (out_time !== null && typeof out_time !== 'number') {
  //     throw new Error('out_time must be a number or null');
  //   }

  //   // 2) Adjust each epoch for IST‐day
  //   // const adjMorning   = epochToIST(morning_in_time);
  //   // const adjAfternoon = epochToIST(afternoon_in_time);
  //   // const adjOut       = epochToIST(out_time);

  //   // console.log(adjMorning)

  //   // console.log(adjAfternoon)

  //   // console.log(adjOut)

  //   // 3) Call your stored procedure
  //   try {
  //     await query(
  //       'CALL MarkofflineAttendance1(?, ?, ?, ?)',
  //       [user_id, js, afternoon_in_time, out_time]
  //     );
  //     return { status: true, message: 'Attendance recorded successfully' };
  //   } catch (err) {
  //     if (err.sqlState === '45000') {
  //       // SP signaled a business error
  //       throw new Error(err.sqlMessage);
  //     }
  //     console.error(err);
  //     throw new Error('Database error');
  //   }
  // }

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





    getAttendanceReport: async (date, department_id, cader_id) => {
      try {
        console.log(`Fetching report for date: ${date}, department_id: ${department_id}, cader_id: ${cader_id}`);
  
        // Execute the stored procedure
        const [result] = await query("CALL GetAttendanceReport(?, ?, ?)", [date, department_id, cader_id]);
  
        // The result is an array of rows; take the first row since the SP returns one row
        const report = result[0];
  
        return {
          total_users: report.total_users,
          morning_present: report.morning_present,
          afternoon_present: report.afternoon_present,
          evening_present: report.evening_present
        };
      } catch (error) {
        if (error.sqlState === '45000') {
          throw { status: false, message: error.sqlMessage };
        }
        throw { status: false, message: "Database error while fetching attendance report" };
      }
    }








    }

// UTC to Epoch conversion
export const utcToEpoch = (utcString) => {
  return Math.floor(new Date(utcString).getTime() / 1000);
};

// Epoch to UTC conversion
export const epochToUTC = (epoch) => {
  return new Date(epoch * 1000).toISOString();
};

// IST to Epoch conversion
export const istToEpoch = (istString) => {
  const date = new Date(`${istString} +05:30`);
  return Math.floor(date.getTime() / 1000);
};

// Epoch to IST conversion
export const epochToIST = (epoch) => {
  const date = new Date(epoch * 1000);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

// Get current IST epoch
export const getCurrentISTEpoch = () => {
  // Get current date in IST
  const istDate = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  // Convert IST string to Date object
  const date = new Date(istDate);
  // Convert to epoch (seconds since Unix epoch)
  return Math.floor(date.getTime() / 1000);
};

// Get current time in all formats
export const getCurrentTime = () => {
  const now = getCurrentISTEpoch(); // Current IST epoch

  return {
    epoch: now,
    utc: epochToUTC(now),
    ist: epochToIST(now),
  };
};

// Example usage
const example = () => {
  const istEpoch = getCurrentISTEpoch();
  // Current time in all formats
  const current = getCurrentTime();
};

example();
