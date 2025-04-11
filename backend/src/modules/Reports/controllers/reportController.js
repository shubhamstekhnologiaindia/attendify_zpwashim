import { reportService } from "../services/reportService.js";


export const AttendanceReports = {
    getAttendanceReportForDay: async (req, res) => {
        try {
          const { date, department_id, cader_id } = req.body;
    
          // Validate required fields
          if (!date || !department_id) {
            return res.status(400).json({ status: false, message: "date and department_id are required" });
          }
    
          // Call the service with date, department_id, and optional cader_id
          const result = await reportService.getAttendanceReport(date, department_id, cader_id || null);
          return res.status(200).json({
            status: true,
            data: result,
            message: "Attendance report retrieved successfully"
          });
        } catch (error) {
          return res.status(400).json({ status: false, message: error.message });
        }
      },

      getAttendanceReportForMonth: async (req, res) => {
        try {
          const { month, year, department_id, cader_id } = req.body;
          console.log("fetch report for month:", { month, year, department_id, cader_id } );

            // Validate required fields
            // if (!month || !year || !department_id) {
            //     return res.status(400).json({
            //         status: false,
            //         message: "Missing required fields: month, year, department_id"
            //     });
            // }
    
            // Optional: allow cader_id to be null if not passed
            const report = await reportService.getMonthlyAttendanceReport(
                month,
                year,
                department_id,
                cader_id || null
            );
            return res.status(200).json({
                status: true,
                data: report,
                message: "Monthly attendance report fetched successfully"
            });
        } catch (error) {
            console.error("Monthly Attendance Error:", error);
            return res.status(500).json({
                status: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
    
    }