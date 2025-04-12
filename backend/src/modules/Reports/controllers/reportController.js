import { reportService } from "../services/reportService.js";


export const AttendanceReports = {
    getAttendanceReportForDay: async (req, res) => {
        try {
          const { start_date, department_id, cader_id } = req.query;
    
          // Validate required fields
          if (!start_date || !department_id) {
            return res.status(400).json({ status: false, message: "date and department_id are required" });
          }
    
          // Call the service with date, department_id, and optional cader_id
          const result = await reportService.getAttendanceReportForDay(start_date, department_id, cader_id || null);
          return res.status(200).json({
            status: true,
            data: result,
            message: "Attendance report retrieved successfully"
          });
        } catch (error) {
          return res.status(400).json({ status: false, message: error.message });
        }
      },
      getAttendanceReportForWeek: async (req, res) => {
        try {
            const { start_date, department_id, cader_id } = req.query;

            // Validate required fields
            if (!start_date || !department_id) {
                return res.status(400).json({ 
                    status: false, 
                    message: "start_date and department_id are required" 
                });
            }

            // Call the service
            const result = await reportService.getWeeklyAttendanceReport(
                start_date, 
                department_id, 
                cader_id || null
            );

            return res.status(200).json({
                status: true,
                data: result,
                message: "Weekly attendance report retrieved successfully"
            });
        } catch (error) {
            return res.status(400).json({ 
                status: false, 
                message: error.message 
            });
        }
    },

    GetAttReportForDaySecondScreen: async (req, res) => {
      try {
        const { start_date, department_id, attendance_period, headquarter_id, taluka_id, sanstha_id, cader_id } = req.query;

        console.log(req.query)
  
        // Validate required fields
        if (!start_date || !department_id || !attendance_period) {
          return res.status(400).json({ status: false, message: "start_date, department_id, and attendance_period are required" });
        }
  
 
        // Call the service with the parameters
        const result = await reportService.GetAttReportForDaySecondScreen(
          start_date,
          department_id,
          attendance_period,
          headquarter_id || null,
          taluka_id || null,
          sanstha_id || null,
          cader_id || null
        );
  
        return res.status(200).json({
          status: true,
          data: result.report,
          message: "Attendance report retrieved successfully"
        });
      } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
      }
    },



    GetAttReportForWeekSecondScreen: async (req, res) => {
      try {
        const { start_date, department_id, attendance_period, headquarter_id, taluka_id, sanstha_id, cader_id } = req.query;

        console.log(req.query)
  
        // Validate required fields
        if (!start_date || !department_id || !attendance_period) {
          return res.status(400).json({ status: false, message: "date, department_id, and attendance_period are required" });
        }
  
 
        // Call the service with the parameters
        const result = await reportService.GetAttReportForWeekSecondScreen(
          start_date,
          department_id,
          attendance_period,
          headquarter_id || null,
          taluka_id || null,
          sanstha_id || null,
          cader_id || null
        );
  
        return res.status(200).json({
          status: true,
          data: result.report,
          message: "Attendance report retrieved successfully"
        });
      } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
      }
    },



    
    }