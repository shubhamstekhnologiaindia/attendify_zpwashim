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
      }}