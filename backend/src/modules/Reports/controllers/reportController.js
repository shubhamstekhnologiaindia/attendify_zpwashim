import { reportService } from "../services/reportService.js";


export const AttendanceReports = {
    getAttendanceReportForDay: async (req, res) => {
        try {
          const { date, department_id, cader_id } = req.query;
    
          // Validate required fields
          if (!date || !department_id) {
            return res.status(400).json({ status: false, message: "date and department_id are required" });
          }
    
          // Call the service with date, department_id, and optional cader_id
          const result = await reportService.getAttendanceReportForDay(date, department_id, cader_id || null);
          return res.status(200).json({
            status: true,
            data: result,
            message: "Attendance report retrieved successfully"
          });
        } catch (error) {
          return res.status(400).json({ status: false, message: error.message });
        }
      },
  
    getAttendanceReportForYear: async (req, res) => {
      try {
          const { year, department_id, cader_id } = req.query;

          // Validate required fields
          if (!year || !department_id) {
              return res.status(400).json({ status: false, message: "year and department_id are required" });
          }

          // Call the service with year, department_id, and optional cader_id
          const result = await reportService.getAttendanceReportForYear(year, department_id, cader_id || null);
          return res.status(200).json({
              status: true,
              data: result,
              message: "Yearly attendance report retrieved successfully"
          });
      } catch (error) {
          return res.status(400).json({ status: false, message: error.message });
      }
  },
  // New endpoint for monthly report
  getAttendanceReportForMonth: async (req, res) => {
    try {
        const { year, month, department_id, cader_id } = req.body;
        // Validate required fields
        if (!year || !month || !department_id) {
            return res.status(400).json({ status: false, message: "year, month, and department_id are required" });
        }
        // Call the service
        const result = await reportService.getAttendanceReportForMonth(year, month, department_id, cader_id || null);
        return res.status(200).json({
            status: true,
            data: result,
            message: "Monthly attendance report retrieved successfully"
        });
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
},
};