import { query } from "../../../../utils/database.js";


export const reportService = {

    getAttendanceReportForDay: async (start_date, department_id, cader_id) => {
        try {
          console.log(`Fetching report for date: ${start_date}, department_id: ${department_id}, cader_id: ${cader_id}`);
    
          // Execute the stored procedure
          const [result] = await query("CALL GetAttendanceReportForDay(?, ?, ?)", [start_date, department_id, cader_id]);
    
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
        
    },
    getWeeklyAttendanceReport: async (start_date, department_id, cader_id) => {
      try {
          console.log(`Fetching weekly report from: ${start_date}, department: ${department_id}, cader: ${cader_id}`);

          // Execute the stored procedure
          const [result] = await query("CALL GetWeeklyAttendanceReport(?, ?, ?)", [
              start_date,
              department_id,
              cader_id
          ]);

          // The result is an array of rows - map to desired format
          return result.map(row => ({
              date: row.date,
              total_users: row.total_users,
              morning_present: row.morning_present,
              afternoon_present: row.afternoon_present,
              evening_present: row.evening_present
          }));
      } catch (error) {
          if (error.sqlState === '45000') {
              throw { status: false, message: error.sqlMessage };
          }
          throw { 
              status: false, 
              message: "Database error while fetching weekly attendance report" 
          };
      }
  },

  GetAttReportForDaySecondScreen: async (start_date, department_id, attendance_period, headquarter_id, taluka_id, sanstha_id, cader_id) => {
    try {
      console.log(`Fetching report for date: ${start_date}, department_id: ${department_id}, attendance_period: ${attendance_period}, filters:`, { headquarter_id, taluka_id, sanstha_id, cader_id });

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

      const report = result[0];

return{report}

    } catch (error) {
      if (error.sqlState === '45000') {
        throw { status: false, message: error.sqlMessage };
      }
      throw { status: false, message: "Database error while fetching attendance report" };
    }
  },




  GetAttReportForWeekSecondScreen: async (start_date, department_id, attendance_period, headquarter_id, taluka_id, sanstha_id, cader_id) => {
    try {
     // console.log(`Fetching report for date: ${start_date}, department_id: ${department_id}, attendance_period: ${attendance_period}, filters:`, { headquarter_id, taluka_id, sanstha_id, cader_id });

      // Execute the stored procedure
      const [result] = await query("CALL GetAttReportForWeekSecondScreen(?, ?, ?, ?, ?, ?, ?)", [
        start_date,
        department_id,
        attendance_period,
        headquarter_id,
        taluka_id,
        sanstha_id,
        cader_id
      ]);

      // const report = result[0];

      // console.log(result)

      return result.map(row => ({
        date: row.date,
        total_users: row.total_users,
        morning_present: row.morning_present,
        afternoon_present: row.afternoon_present,
        evening_present: row.evening_present
    }));


// return{result}

    } catch (error) {
      if (error.sqlState === '45000') {
        throw { status: false, message: error.sqlMessage };
      }
      throw { status: false, message: "Database error while fetching attendance report" };
    }
  },

  }