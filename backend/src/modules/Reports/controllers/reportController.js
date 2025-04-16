import { reportService } from "../services/reportService.js";

export const AttendanceReports = {
  getAttendanceReportForDay: async (req, res) => {
    try {
      const { start_date, department_id, cader_id } = req.query;

      // Validate required fields
      if (!start_date || !department_id) {
        return res
          .status(400)
          .json({
            status: false,
            message: "date and department_id are required",
          });
      }

      // Call the service with date, department_id, and optional cader_id
      const result = await reportService.getAttendanceReportForDay(
        start_date,
        department_id,
        cader_id || null
      );
      return res.status(200).json({
        status: true,
        data: result,
        message: "Attendance report retrieved successfully",
      });
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  },
  getAttendanceReportForWeek: async (req, res) => {
    try {
      const { start_date, department_id, cader_id } = req.query;


      // console.log(req.query)

      // Validate required fields
      if (!start_date || !department_id) {
        return res.status(400).json({
          status: false,
          message: "start_date and department_id are required",
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

  getAttendanceReportForYear: async (req, res) => {
    try {
      const { year, department_id, cader_id } = req.query;

      // Validate required fields
      if (!year || !department_id) {
        return res
          .status(400)
          .json({
            status: false,
            message: "year and department_id are required",
          });
      }

      // Call the service with year, department_id, and optional cader_id
      const result = await reportService.getAttendanceReportForYear(
        year,
        department_id,
        cader_id || null
      );
      return res.status(200).json({
        status: true,
        data: result,
        message: "Yearly attendance report retrieved successfully",
      });
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  },
  // New endpoint for monthly report
  getAttendanceReportForMonth: async (req, res) => {
    try {
      const { year, month, department_id, cader_id } = req.query;
      // Validate required fields
      if (!year || !month || !department_id) {
        return res
          .status(400)
          .json({
            status: false,
            message: "year, month, and department_id are required",
          });
      }
      // Call the service
      const result = await reportService.getAttendanceReportForMonth(
        year,
        month,
        department_id,
        cader_id || null
      );
      return res.status(200).json({
        status: true,
        data: result,
        message: "Monthly attendance report retrieved successfully",
      });
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  },

  getAttendanceReportMobno: async (req, res) => {
    try {
      const { mobile_no, date, week, month, year } = req.body;

      // Validate required fields
      if (!mobile_no) {
        return res.status(400).json({ status: false, message: "mobile_no is required" });
      }

      // Validate that at least one time period is provided
      if (!date && !week && !month && !year) {
        return res.status(400).json({ status: false, message: "At least one of date, week, month, or year must be provided" });
      }

      // Validate date format if provided
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ status: false, message: "Invalid date format: Use YYYY-MM-DD" });
      }

      // Validate week if provided
      if (week !== undefined && (week < 1 || week > 53)) {
        return res.status(400).json({ status: false, message: "week must be between 1 and 53" });
      }

      // Validate month if provided
      if (month !== undefined && (month < 1 || month > 12)) {
        return res.status(400).json({ status: false, message: "month must be between 1 and 12" });
      }

      // Validate year requirement for week or month
      if ((week !== undefined || month !== undefined) && !year) {
        return res.status(400).json({ status: false, message: "year is required when week or month is provided" });
      }

      // Call service
      const result = await reportService.getAttendanceReportMobno({ mobile_no, date, week, month, year });

      return res.status(200).json({
        status: true,
        data: result,
        message: "Attendance retrieved successfully"
      });
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
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
        data: result,
        message: "Attendance report retrieved successfully"
      });
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  },
  GetAttendanceReportForYearSecondScreen: async (req, res) => {
    try {
      const { year, department_id, attendance_period, headquarter_id, taluka_id, sanstha_id, cader_id } = req.query;
      console.log("parameters:", req.query);
  
      if (!year || !department_id || !attendance_period) {
        return res.status(400).json({
          status: false,
          message: "year, department_id and attendance_period are required",
        });
      }
  
      const result = await reportService.GetAttendanceReportForYearSecondScreen(
        year,
        department_id,
        attendance_period,
        headquarter_id || null,
        taluka_id || null,
        sanstha_id || null,
        cader_id || null
      );
  
      return res.status(200).json({
        status: true,
        data: result,
        message: "Yearly attendance report retrieved successfully",
      });
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  },

  GetAttReportFormonthSecondScreen: async (req, res) => {
    try {
      const {
        month,
        department_id,
        attendance_period,
        headquarter_id,
        taluka_id,
        sanstha_id,
        cader_id,
      } = req.query;
 
      console.log(req.query);
 
      // Validate required fields
      if (!month || !department_id || !attendance_period) {
        return res
          .status(400)
          .json({
            status: false,
            message: "date, department_id, and attendance_period are required",
          });
      }
 
      // Call the service with the parameters
      const result = await reportService.GetAttReportFormonthSecondScreen(
        month,
        department_id,
        attendance_period,
        headquarter_id || null,
        taluka_id || null,
        sanstha_id || null,
        cader_id || null
      );
 
      return res.status(200).json({
        status: true,
        data: result,
        message: "Attendance report retrieved successfully",
      });
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  },


 GetAttendanceReportForWeekThirdScreen: async (req, res) => {
    try {
      const { start_date, department_id, cader_id, headquarter_id, attendance_period } = req.query;
      console.log(req.query);  // For debugging: print the query params

      if (!start_date || !department_id || !cader_id || !headquarter_id || !attendance_period) {
        return res.status(400).json({
          status: false,
          message: "start_date, department_id, cader_id, headquarter_id, and attendance_period are required",
        });
      }

      // Fetch attendance data using the service
      const result = await reportService.GetAttendanceReportForWeekThirdScreen(
        start_date,
        department_id,
        cader_id,
        headquarter_id,
        attendance_period
      );

      return res.status(200).json({
        status: true,
        data: result,
        message: "Week attendance report retrieved successfully",
      });

    } catch (error) {
      console.error(error);  // Log the error for debugging
      return res.status(400).json({ status: false, message: error.message });
    }
},

GetAttendanceReportForWeekDateForthScreen: async (req, res) => {
  try {
      const { date, cader_id, location_id, attendance_period } = req.query;
      console.log(req.query);
      if (!date || !cader_id || !location_id || !attendance_period) {
          return res.status(400).json({
              status: false,
              message: "date, cader_id, location_id, and attendance_period are required"
          });
      }

      const result = await reportService.GetAttendanceReportForWeekDateForthScreen(
          date,
          cader_id,
          location_id,
          attendance_period
      );

      return res.status(200).json({
          status: true,
          data: result,
          message: "Attendance report fetched successfully"
      });

  } catch (error) {
      return res.status(500).json({
          status: false,
          message: error.message || "Error fetching attendance data"
      });
  }
},


GetAttendanceReportForYearForthScreen: async (req, res) => {
  try {
      const { year, cader_id, location_id, attendance_period } = req.query;
      console.log(req.query);
      if (!year || !cader_id || !location_id || !attendance_period) {
          return res.status(400).json({
              status: false,
              message: "year, cader_id, location_id, and attendance_period are required"
          });
      }

      const result = await reportService.GetAttendanceReportForYearForthScreen(
          year,
          cader_id,
          location_id,
          attendance_period
      );

      return res.status(200).json({
          status: true,
          data: result,
          message: "Attendance report fetched successfully"
      });

  } catch (error) {
      return res.status(500).json({
          status: false,
          message: error.message || "Error fetching attendance data"
      });
  }
},
  
GetAttendanceReportForDayThirdScreen: async (req, res) => {
  try {
    const { start_date, department_id, office_location_id, attendance_period } = req.query;

    // Validate input
    if (!start_date || !department_id || !office_location_id || !attendance_period) {
      return res.status(400).json({
        status: false,
        message: "date, department_id, office_location_id, and attendance_period are required",
      });
    }

    const result = await reportService.GetAttendanceReportForDayThirdScreen(
      start_date,
      parseInt(department_id),
      parseInt(office_location_id),
      parseInt(attendance_period)
    );

    return res.status(200).json({
      status: true,
      data: result,
      message: "Day attendance report retrieved successfully",
    });

  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(400).json({
      status: false,
      message: error.message || "Something went wrong",
    });
  }
}

};
