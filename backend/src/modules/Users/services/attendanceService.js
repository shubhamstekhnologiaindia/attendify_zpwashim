import { query } from "../../../../utils/database.js";

import moment from "moment-timezone";





export const AttendanceService = {
  recordAttendance: async (user_id, inOutId, istTime,location_lat, location_lon) => {
    try {
      console.log(istTime); // Log the IST time for debugging

      await query("CALL MarkAttendance(?, ?, ?,?,?)", [user_id, inOutId, istTime,location_lat, location_lon]);

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
      if (!employee_id || isNaN(employee_id)) {
          throw new Error('Valid employee_id is required');
      }

      // Fetch field_status from users table
      const userSql = `SELECT field_status FROM users WHERE id = ? LIMIT 1`;
      const userResult = await query(userSql, [employee_id]);

      if (userResult.length === 0) {
          throw new Error('User not found');
      }

      const field_status = userResult[0].field_status;

      // Fetch attendance records using stored procedure
      const [attendanceRecords] = await query(
          'CALL get_attendance_by_employee(?)',
          [employee_id]
      );

      console.log(attendanceRecords);

      return { field_status, attendanceData: attendanceRecords || [] };
  } catch (error) {
      console.error('Error in getUserAttendance service:', error);
      throw error;
  }
},

  recordOfflineAttendance: async (user_id, morning_in_time, afternoon_in_time, out_time) => {
    try {
      // Handle NULL values for optional time fields
      const morning_in_time_sql = morning_in_time || null;
      const afternoon_in_time_sql = afternoon_in_time || null;
      const out_time_sql = out_time || null;

      await query("CALL MarkOfflineAttendance(?, ?, ?, ?)", [
        user_id,
        morning_in_time_sql,
        afternoon_in_time_sql,
        out_time_sql,
      ]);

      return {
        status: true,
        message: "Offline attendance recorded successfully",
      };
    } catch (error) {
      if (error.sqlState === "45000") {
        throw { status: false, message: error.sqlMessage };
      }
      throw { status: false, message: "Database error" };
    }
  },
  getAttendanceReport: async (date, department_id, cader_id) => {
    try {
      console.log(
        `Fetching report for date: ${date}, department_id: ${department_id}, cader_id: ${cader_id}`
      );

      // Execute the stored procedure
      const [result] = await query("CALL GetAttendanceReport(?, ?, ?)", [
        date,
        department_id,
        cader_id,
      ]);

      // The result is an array of rows; take the first row since the SP returns one row
      const report = result[0];

      return {
        total_users: report.total_users,
        morning_present: report.morning_present,
        afternoon_present: report.afternoon_present,
        evening_present: report.evening_present,
      };
    } catch (error) {
      if (error.sqlState === "45000") {
        throw { status: false, message: error.sqlMessage };
      }
      throw {
        status: false,
        message: "Database error while fetching attendance report",
      };
    }
  },
};

