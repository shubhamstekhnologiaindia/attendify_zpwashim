import { query } from "../../../../utils/database.js";


export const reportService = {

    getAttendanceReportForDay: async (date, department_id, cader_id) => {
        try {
          console.log(`Fetching report for date: ${date}, department_id: ${department_id}, cader_id: ${cader_id}`);
    
          // Execute the stored procedure
          const [result] = await query("CALL GetAttendanceReportForDay(?, ?, ?)", [date, department_id, cader_id]);
    
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
        
    }}