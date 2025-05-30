import { query } from "../../../../utils/database.js";

import moment from "moment-timezone";

import dotenv from "dotenv";
dotenv.config();


import axios from "axios";

async function getAddressFromCoords(lat, lon) {
  const url = process.env.GEO_LOCATION_URL;
  const params = {
    lat,
    lon,
    apiKey:process.env.GEOAPIFY_APP_KEY,  // your 5a82… key
  };

  const { data } = await axios.get(url, { params });
  if (!data.features || !data.features.length) {
    return null;
  }
  return data.features[0].properties.formatted;
}



export const AttendanceService = {
 recordAttendance: async (user_id, inOutId, istTime, location_lat, location_lon) => {
  try {
    let address = null;
 
    if (location_lat != null && location_lon != null) {
      address = await getAddressFromCoords(location_lat, location_lon);
    }
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

 recordOfflineAttendance : async(
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
)=> {
  try {
    // Handle NULL values for optional time fields
    const morning_in_time_sql = morning_in_time || null;
    const afternoon_in_time_sql = afternoon_in_time || null;
    const out_time_sql = out_time || null;

    // Prepare concurrent geocoding requests
    const geocodingPromises = [];
    if (morning_in_time_sql && morning_lat && morning_lon) {
      geocodingPromises.push(
        getAddressFromCoords(morning_lat, morning_lon).then((addr) => ({ type: 'morning', address: addr }))
      );
    }
    if (afternoon_in_time_sql && afternoon_lat && afternoon_lon) {
      geocodingPromises.push(
        getAddressFromCoords(afternoon_lat, afternoon_lon).then((addr) => ({ type: 'afternoon', address: addr }))
      );
    }
    if (out_time_sql && out_lat && out_lon) {
      geocodingPromises.push(
        getAddressFromCoords(out_lat, out_lon).then((addr) => ({ type: 'out', address: addr }))
      );
    }

    // Execute all geocoding requests concurrently
    const addresses = await Promise.all(geocodingPromises);

    // Assign addresses based on type
    let morning_address = null;
    let afternoon_address = null;
    let out_address = null;
    addresses.forEach(({ type, address }) => {
      if (type === 'morning') morning_address = address;
      else if (type === 'afternoon') afternoon_address = address;
      else if (type === 'out') out_address = address;
    });

    // Call the stored procedure
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

