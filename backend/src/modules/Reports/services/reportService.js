import { query } from "../../../../utils/database.js";


export const reportService = {
    
    getAttendanceReport: async (date, department_id, cader_id) => {
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
        
    },


    // getMonthlyAttendanceReport: async (month, year, department_id, cader_id) => {
    //   try {
    //     const [resultSets] = await query("CALL GetAttendanceReportForMonth(?, ?, ?, ?)", [
    //       month,
    //       year,
    //       department_id,
    //       cader_id
    //     ]);
        
    //     const reportData = resultSets; 
        
    //     if (!Array.isArray(reportData)) {
    //       throw new Error("No report data returned");
    //     }
        
    //     return reportData.map(row => ({
    //       date: row.date,
    //       total_users: row.total_users,
    //       morning_present: row.morning_present,
    //       afternoon_present: row.afternoon_present,
    //       evening_present: row.evening_present
    //     }));
    //   } catch (error) {
    //     console.error("Error executing GetAttendanceReportForMonth:", error);
    //     throw {
    //       status: false,
    //       message: error.message || "Unknown error during monthly attendance report"
    //     }
    //   }
      
    // }
    getMonthlyAttendanceReport: async (month, year, department_id, cader_id) => {
      try {
        const [resultSets] = await query("CALL GetAttendanceReportForMonth(?, ?, ?, ?)", [
          month,
          year,
          department_id,
          cader_id
        ]);

        const reportData = resultSets;
    
        if (!Array.isArray(reportData)) {
          throw new Error("No report data returned");
        }
    
        return reportData.map(row => {
          const total = row.total_users || 0;
          const morning = row.morning_present || 0;
          const afternoon = row.afternoon_present || 0;
          const evening = row.evening_present || 0;
    
          return {
            date: row.date,
            total_users: total,
    
            morning_present: morning,
            morning_absent: total - morning,
    
            afternoon_present: afternoon,
            afternoon_absent: total - afternoon,
    
            evening_present: evening,
            evening_absent: total - evening
          };
        });
      } catch (error) {
        console.error("Error executing GetAttendanceReportForMonth:", error);
        throw {
          status: false,
          message: error.message || "Unknown error during monthly attendance report"
        };
      }
    }
    
  
  
  }