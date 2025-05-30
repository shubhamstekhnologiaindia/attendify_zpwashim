import { query } from "../../../../utils/database.js";

import moment from "moment-timezone";


import node_geocoder from "node-geocoder";



// Example: using OpenStreetMap (free, no API key required)
const geocoder = node_geocoder({
  provider: 'openstreetmap'
});

async function getAddressFromCoords(lat, lon) {
  try {
    const [result] = await geocoder.reverse({ lat, lon });
    return result.formattedAddress; 
  } catch (err) {
    console.error('Geocoding error:', err);
    throw err;
  }
}

export const AttendanceService = {
 recordAttendance: async (user_id, inOutId, istTime, location_lat, location_lon) => {
  try {
    let address = null;
 
    if (location_lat != null && location_lon != null) {
      address = await getAddressFromCoords(location_lat, location_lon);
    }
    console.log('Resolved address:', address);
    await query(
      "CALL MarkAttendance(?, ?, ?, ?)",
      [user_id, inOutId, istTime, address]
    );

    return {
      status: true,
      message: inOutId === 3
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

  recordOfflineAttendance: async (
    user_id,
    morning_in_time,
    morning_lat,
    morning_lon,
    afternoon_in_time,
    afternoon_lat,
    afternoon_lon,
    out_time,
    out_lat,
    out_lon
  ) => {
    try {
      // Handle NULL values for optional time fields
      const morning_in_time_sql = morning_in_time || null;
      const afternoon_in_time_sql = afternoon_in_time || null;
      const out_time_sql = out_time || null;

      // Fetch addresses for each provided lat/lon pair
      let morning_address = null;
      let afternoon_address = null;
      let out_address = null;

      // Morning address
      if (morning_in_time_sql && morning_lat && morning_lon) {
        morning_address = await getAddressFromCoords(morning_lat, morning_lon);
      }

      // Afternoon address
      if (afternoon_in_time_sql && afternoon_lat && afternoon_lon) {
        afternoon_address = await getAddressFromCoords(afternoon_lat, afternoon_lon);
      }

      // Out address
      if (out_time_sql && out_lat && out_lon) {
        out_address = await getAddressFromCoords(out_lat, out_lon);
      }

      // Call the stored procedure with the new address parameters
      await query("CALL MarkOfflineAttendance(?, ?, ?, ?, ?, ?, ?)", [
        user_id,
        morning_in_time_sql,
        afternoon_in_time_sql,
        out_time_sql,
        morning_address,
        afternoon_address,
        out_address,
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

