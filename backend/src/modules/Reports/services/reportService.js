import { query } from "../../../../utils/database.js";
import {
  encryptDeterministic,
  decryptDeterministic,
  decrypt,
} from "../../../../utils/crypto.js";

export const reportService = {
  getAttendanceReportForDay: async (start_date, department_id, cader_id) => {
    try {
      console.log(
        `Fetching report for date: ${start_date}, department_id: ${department_id}, cader_id: ${cader_id}`
      );

      // Execute the stored procedure
      const [result] = await query("CALL GetAttendanceReportForDay(?, ?, ?)", [
        start_date,
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
  getWeeklyAttendanceReport: async (start_date, department_id, cader_id) => {
    try {
      console.log(
        `Fetching weekly report from: ${start_date}, department: ${department_id}, cader: ${cader_id}`
      );

      // Execute the stored procedure
      const [result] = await query("CALL GetWeeklyAttendanceReport(?, ?, ?)", [
        start_date,
        department_id,
        cader_id,
      ]);

      // The result is an array of rows - map to desired format
      return result.map((row) => ({
        date: row.date,
        total_users: row.total_users,
        morning_present: row.morning_present,
        afternoon_present: row.afternoon_present,
        evening_present: row.evening_present,
      }));
    } catch (error) {
      if (error.sqlState === "45000") {
        throw { status: false, message: error.sqlMessage };
      }
      throw {
        status: false,
        message: "Database error while fetching weekly attendance report",
      };
    }
  },

  getAttendanceReportForYear: async (year, department_id, cader_id) => {
    try {
      console.log(
        `Fetching yearly report for year: ${year}, department_id: ${department_id}, cader_id: ${cader_id}`
      );

      // Execute the stored procedure
      const [results] = await query(
        "CALL GetAttendanceReportForYear(?, ?, ?)",
        [year, department_id, cader_id]
      );

      // Map results to the desired format
      const report = results.map((row) => ({
        date: row.date,
        total_users: row.total_users,
        morning_present: row.morning_present,
        afternoon_present: row.afternoon_present,
        evening_present: row.evening_present,
      }));

      return report;
    } catch (error) {
      if (error.sqlState === "45000") {
        throw { status: false, message: error.sqlMessage };
      }
      throw {
        status: false,
        message: "Database error while fetching yearly attendance report",
      };
    }
  },

  getAttendanceReportForMonth: async (year, month, department_id, cader_id) => {
    try {
      console.log(
        `Fetching monthly report for year: ${year}, month: ${month}, department_id: ${department_id}, cader_id: ${cader_id}`
      );
      const [results] = await query(
        "CALL GetAttendanceReportForMonth(?, ?, ?, ?)",
        [year, month, department_id, cader_id]
      );
      const report = results.map((row) => ({
        date: row.date,
        total_users: row.total_users,
        morning_present: row.morning_present,
        afternoon_present: row.afternoon_present,
        evening_present: row.evening_present,
      }));
      return report;
    } catch (error) {
      if (error.sqlState === "45000") {
        throw { status: false, message: error.sqlMessage };
      }
      throw {
        status: false,
        message: "Database error while fetching monthly attendance report",
      };
    }
  },
  getAttendanceReportMobno: async ({ mobile_no, date, week, month, year }) => {
    try {
      console.log(`Fetching attendance for mobile: ${mobile_no}, date: ${date}, week: ${week}, month: ${month}, year: ${year}`);
  
      const encrypted_mobile = encryptDeterministic(mobile_no);
      const params = [
        encrypted_mobile,
        date || null,
        week || null,
        month || null,
        year || null,
      ];
  
      const [results] = await query("CALL GetAttendanceReportOnMobno(?, ?, ?, ?, ?)", params);
  
      const report = results.map((row) => {
        const firstName = row.first_name ? decrypt(row.first_name) : "";
        const middleName = row.middle_name ? decrypt(row.middle_name) : "";
        const lastName = row.last_name ? decrypt(row.last_name) : "";
  
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
  
        const isPresent = row.att_morning_in_time !== null;
        let total_hours = 0;
  
        if (isPresent && row.att_out_time) {
          const inTime = new Date(row.att_morning_in_time);
          const outTime = new Date(row.att_out_time);
          total_hours = Math.round((outTime - inTime) / (1000 * 60 * 60));
        }
  
        return {
          name: fullName,
          user_profile: row.user_profile,
          date: row.att_attendance_date
            ? row.att_attendance_date.toISOString().split("T")[0]
            : row.report_date.toISOString().split("T")[0],
          cader_name: row.cader_id,
          mob_no: row.encrypted_mob_no ? decryptDeterministic(row.encrypted_mob_no) : null,
          total_hours,
          status: isPresent ? "Present" : "Absent",
        };
      });
  
      return report;
    } catch (error) {
      if (error.sqlState === "45000") {
        throw { status: false, message: error.sqlMessage };
      }
      throw {
        status: false,
        message: error.message || "Database error while fetching attendance",
      };
    }
  },

  GetAttReportForDaySecondScreen: async (
    start_date,
    department_id,
    attendance_period,
    headquarter_id,
    taluka_id,
    sanstha_id,
    cader_id
  ) => {
    try {
      console.log(
        `Fetching report for date: ${start_date}, department_id: ${department_id}, attendance_period: ${attendance_period}, filters:`,
        { headquarter_id, taluka_id, sanstha_id, cader_id }
      );

      // Execute the stored procedure
      const [result] = await query("CALL GetAttReportForDaySecondScreen(?, ?, ?, ?, ?, ?, ?)", [
        start_date,
        department_id,
        attendance_period,
        headquarter_id,
        taluka_id,
        sanstha_id,
        cader_id
      ]);
 
     // const report = result[0];
 
      const report= result.map(row=>({
        date:row.date,
        total_users:row.total_users,
        present_users : row.present_count,
        absent_users: row.total_users- row.present_count
      }))
 
      return{report}
 
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

  GetAttReportForWeekSecondScreen: async (
    start_date,
    department_id,
    attendance_period,
    headquarter_id,
    taluka_id,
    sanstha_id,
    cader_id
  ) => {
    try {
      const [result] = await query(
        "CALL GetAttReportForWeekSecondScreen(?, ?, ?, ?, ?, ?, ?)",
        [
          start_date,
          department_id,
          attendance_period,
          headquarter_id,
          taluka_id,
          sanstha_id,
          cader_id,
        ]
      );

      return result.map((row) => ({
        date: row.date,
        total_users: row.total_users,
        present_users: row.present_count,
        absent_users: row.total_users - row.present_count,
      }));
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

  GetAttReportFormonthSecondScreen: async (month, department_id, attendance_period, headquarter_id, taluka_id, sanstha_id, cader_id) => {
    try {
   
      const [result] = await query("CALL GetAttReportForMonthSecondScreen(?, ?, ?, ?, ?, ?, ?)", [
        month,
        department_id,
        attendance_period,
        headquarter_id,
        taluka_id,
        sanstha_id,
        cader_id
      ]);

      return result.map(row => ({
        date: row.date,
        total_users: row.total_users,
        present_users: row.present_count,
        absent_users:row.total_users-row.present_count,
    }));
 
    } catch (error) {
      if (error.sqlState === '45000') {
        throw { status: false, message: error.sqlMessage };
      }
      throw { status: false, message: "Database error while fetching attendance report" };
    }
  },

  GetAttendanceReportForYearSecondScreen: async (year, department_id, attendance_period, headquarter_id, taluka_id, sanstha_id, cader_id) => {
    try {
      const [result] = await query(
        "CALL GetAttReportForYearSecondScreen(?, ?, ?, ?, ?, ?, ?)", 
        [
          year,
          department_id,
          attendance_period,
          headquarter_id,
          taluka_id,
          sanstha_id,
          cader_id
        ]
      );
  
      return result.map(row => ({
        date: new Date(row.date).toISOString().split('T')[0], // Only date part
        total_users: row.total_users,
        present_users: row.present_users,
        absent_users: row.total_users - row.present_users,
      }));
    } catch (error) {
      if (error.sqlState === '45000') {
        throw { status: false, message: error.sqlMessage };
      }
      throw { status: false, message: "Database error while fetching yearly attendance report" };
    }
  },
  
  GetAttendanceReportForWeekThirdScreen: async (start_date, department_id, cader_id, headquarter_id, attendance_period) => {
    try {
        const [result] = await query(
            "CALL GetAttReportForWeekThirdScreen(?, ?, ?, ?, ?)", 
            [start_date, department_id, cader_id, headquarter_id, attendance_period]
        );
        
        if (!result || result.length === 0) {
            throw new Error("No data returned from the database.");
        }

        return result.map(row => {
            const dateObj = new Date(row.date ); 
            const formattedDate = dateObj.toISOString().split('T')[0]; // yyyy-mm-dd
            return {
                date: formattedDate,
                total_users: row.total_users,
                present_users: row.present_count,
                absent_users: row.total_users - row.present_count,
            };
        });

    } catch (error) {
        console.error("Error occurred in GetAttendanceReportForWeekThirdScreen:", error);  // Log full error for debugging
        throw { status: false, message: error.message || "Database error while fetching attendance report" };
    }
},

GetAttendanceReportForWeekDateForthScreen: async (start_date, cader_id, location_id, attendance_period) => {
  try {
    const [result] = await query(
      "CALL GetAttReportShowEmpDetailsByDate(?, ?, ?, ?)",
      [start_date, cader_id, location_id, attendance_period]
    );

    if (!result || result.length === 0) {
      throw new Error("No attendance data found for the given filters.");
    }

    return result.map(row => {
      let first_name = "Decryption Failed";
      let middle_name = "Decryption Failed";
      let last_name = "Decryption Failed";
      let mobile_no = "Hidden";

      try {
        first_name = decrypt(row.first_name);
        middle_name = decrypt(row.middle_name);
        last_name = decrypt(row.last_name);
        mobile_no = decryptDeterministic(row.mob_no); 
      } catch (decryptionError) {
        console.error("Decryption error:", decryptionError);
      }

      return {
        // emp_id: row.emp_id,  // <-- Return emp_id here
        start_date: row.date,
        location_name: row.location_name,
        first_name,
        middle_name,
        last_name,
        mobile_no,
        cader_name: row.cader_name,
        attendance_status: row.attendance_status, 
        total_hours: row.total_hours || null 
        // user_profile: row.user_profile || null
      };
    });

  } catch (error) {
    console.error("Error in GetAttendanceReportForWeekDateForthScreen:", error);
    throw { status: false, message: error.message || "Database error" };
  }
},

GetAttendanceReportForYearForthScreen:async(year,cader_id,location_id,attendance_period)=>{
  try {
    const [result] = await query(
      "CALL GetAttReportShowEmpDetailsForYear(?, ?, ?, ?)",
      [year, cader_id, location_id, attendance_period]
    );

    if (!result || result.length === 0) {
      throw new Error("No attendance data found for the given filters.");
    }

    return result.map(row => {
      let first_name = "Decryption Failed";
      let middle_name = "Decryption Failed";
      let last_name = "Decryption Failed";
      let mobile_no = "Hidden";

      try {
        first_name = decrypt(row.first_name);
        middle_name = decrypt(row.middle_name);
        last_name = decrypt(row.last_name);
        mobile_no = decryptDeterministic(row.mob_no); 
      } catch (decryptionError) {
        console.error("Decryption error:", decryptionError);
      }

      return {
        // emp_id: row.emp_id,  // <-- Return emp_id here
        date: row.date,
        location_name: row.location_name,
        first_name,
        middle_name,
        last_name,
        mobile_no,
        cader_name: row.cader_name,
        attendance_status: row.attendance_status, 
        total_hours: row.total_hours || null 
        // user_profile: row.user_profile || null
      };
    });

  } catch (error) {
    console.error("Error in GetAttendanceReportForWeekDateForthScreen:", error);
    throw { status: false, message: error.message || "Database error" };
  }
},
GetAttendanceReportForDayThirdScreen: async (start_date, department_id, office_location_id, attendance_period) => {
  try {
    const [result] = await query(
      "CALL GetAttReportForShowCaderName(?, ?, ?, ?)",
      [start_date, department_id, attendance_period, office_location_id]
    );

    if (!result || result.length === 0) {
      throw new Error("No data returned from the database.");
    }

    // Format and add absent count
    return result.map(row => ({
      start_date: row.date,

      cader_id: row.cader_id,            
      cader_name: row.cader_name,
      total_users: row.total_users,
      present_users: row.present_count,
      absent_users: row.total_users - row.present_count
    }));

  } catch (error) {
    console.error("Error in GetAttendanceReportForDayThirdScreen:", error);
    throw { status: false, message: error.message || "Database error while fetching attendance report" };
  }
},

GetAttendanceReportForDayForSanstha : async (start_date, attendance_period, department_id, location_type) => {
  try {
    const [result] = await query(
      'CALL GetAttReportForDayForSanstha(?, ?, ?, ?)',
      [start_date, attendance_period, department_id, location_type]
    );

    if (!result || result.length === 0) {
      throw new Error("No data returned from the database.");
    }

    // Format result to include absent count
    return result.map(row => ({
      loc_id:row.loc_id,
      sanstha_name: row.sanstha_name,
      total_users: row.total_users,
      present_users: row.present_count,
      absent_users: row.total_users - row.present_count
    }));

  } catch (error) {
    console.error("Service Error - GetAttendanceReportForDayForSanstha:", error);
    throw {
      status: false,
      message: error.message || "Database error while fetching attendance report"
    };
  }
},

GetAttReportForMonthUserDetails: async (
  year,
  month,
  cader_id,
  location_id,
  attendance_period
) => {
  try {
    // Validate required fields
    if (!year || !month || !cader_id || !location_id || !attendance_period) {
      throw new Error(
        "year, month, cader_id, location_id, and attendance_period are required"
      );
    }

    // Ensure attendance_period is valid
    if (![1, 2, 3].includes(parseInt(attendance_period))) {
      throw new Error("attendance_period must be 1, 2, or 3");
    }

    // Validate month
    const monthNum = parseInt(month);
    if (monthNum < 1 || monthNum > 12) {
      throw new Error("month must be between 1 and 12");
    }

    // Validate year (basic check for reasonable values)
    const yearNum = parseInt(year);
    if (yearNum < 2000 || yearNum > 2100) {
      throw new Error("year must be between 2000 and 2100");
    }

    const [result] = await query(
      "CALL GetAttReportForMonthForthScreen(?, ?, ?, ?, ?)",
      [
        yearNum,
        monthNum,
        parseInt(cader_id),
        parseInt(location_id),
        parseInt(attendance_period),
      ]
    );

    // Decrypt first_name and last_name for each record
    const decryptedResult = result.map((record) => ({
      ...record,
      first_name: record.first_name ? decrypt(record.first_name) : null,
      middle_name: record.middle_name ? decrypt(record.middle_name) : null,
      last_name: record.last_name ? decrypt(record.last_name) : null,

      // Optionally decrypt mob_no if it's not already handled deterministically
      // mob_no: record.mob_no ? decryptDeterministic(record.mob_no) : null,
    }));

    return decryptedResult;
  } catch (error) {
    throw new Error(error.message || "Error fetching attendance report");
  }
},


GetAttendanceReportForWeekCaderWise: async (start_date, department_id, cader_id, attendance_period, office_location_id) => {
  try {
    const [result] = await query(
      "CALL GetAttReportForWeekCaderWise(?, ?, ?, ?, ?)",
      [start_date, department_id, cader_id, attendance_period, office_location_id]
    );

    if (!result || result.length === 0) {
      throw new Error("No data returned from the database.");
    }

    return result.map(row => ({
      date: row.date,
      cader_id: row.cader_id,
      cader_name: row.cader_name,
      total_users: row.total_users,
      present_users: row.present_users || row.present_count,
      absent_users: row.total_users - (row.present_users || row.present_count)
    }));

  } catch (error) {
    console.error("Error in GetAttendanceReportForWeekCaderWise:", error);
    throw { status: false, message: error.message || "Database error while fetching weekly attendance report" };
  }
},



GetAttendanceReportForWeekSansthaWise: async (
  start_date,
  attendance_period,
  department_id,
  office_location_id
) => {
  try {
    const [result] = await query(
      "CALL GetAttReportForWeekForSanstha(?, ?, ?, ?)",
      [start_date, attendance_period, department_id, office_location_id]
    );

    console.log("Sanstha Report Result:", result);

    if (!result || result.length === 0) {
      throw new Error("No data returned from the database.");
    }

    // Format and add absent count
    return result.map(row => ({
      date: row.date,
      sanstha_id: row.sanstha_id,
      sanstha_name: row.sanstha_name,
      total_users: row.total_users,
      present_users: row.present_count,
      absent_users: row.total_users - row.present_count
    }));

  } catch (error) {
    console.error("Error in GetAttendanceReportForWeekSansthaWise:", error);
    throw {
      status: false,
      message: error.message || "Database error while fetching sanstha-wise weekly attendance report"
    };
  }
}
};
