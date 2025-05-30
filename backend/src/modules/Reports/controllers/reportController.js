import { reportService } from "../services/reportService.js";

export const AttendanceReports = {
  getAttendanceReportForDay: async (req, res) => {
    try {
      const { start_date, department_id, cader_id } = req.query;

      // Validate required fields
      if (!start_date || !department_id) {
        return res.status(400).json({
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
        message: "Weekly attendance report retrieved successfully",
      });
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  getAttendanceReportForYear: async (req, res) => {
    try {
      const { year, department_id, cader_id } = req.query;

      // Validate required fields
      if (!year || !department_id) {
        return res.status(400).json({
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
 
  getAttendanceReportForMonth: async (req, res) => {
    try {
      const { year, month, department_id, cader_id } = req.query;
      // Validate required fields
      if (!year || !month || !department_id) {
        return res.status(400).json({
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
      const {
        mobile_no,
        date,
        week,
        month,
        year,
        department_id,
        cader_id,
      } = req.query;
  
      if (!mobile_no) {
        return res.status(400).json({
          status: false,
          message: "mobile_no is required",
        });
      }
  
      if (!date && !week && !month && !year) {
        return res.status(400).json({
          status: false,
          message: "At least one of date, week, month, or year must be provided",
        });
      }
  
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          status: false,
          message: "Invalid date format: Use YYYY-MM-DD",
        });
      }
  
      if (month && (month < 1 || month > 12)) {
        return res.status(400).json({
          status: false,
          message: "month must be between 1 and 12",
        });
      }
  
      if (month && !year) {
        return res.status(400).json({
          status: false,
          message: "year is required when month is provided",
        });
      }
  
      const result = await reportService.getAttendanceReportMobno({
        mobile_no,
        date,
        week  ,
        month,
        year,
        department_id,
        cader_id,
      });
  
      return res.status(200).json({
        status: true,
        message: "Attendance retrieved successfully",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: error.message || "Something went wrong",
      });
    }
  },  
  
  
  

  // GetAttReportForDaySecondScreen: async (req, res) => {
  //   try {
  //     const {
  //       start_date,
  //       attendance_period,
  //       department_id,
  //       location_id,
  //       cader_id
  //     } = req.query;

  //     // Validate required fields
  //     if (!start_date || !attendance_period || !department_id ) {
  //       return res.status(400).json({
  //         status: false,
  //         message:
  //           'start_date, attendance_period, department_id, are required'
  //       });
  //     }

  //     const report = await reportService.GetAttReportForDaySecondScreen(
  //       start_date,
  //       Number(attendance_period),
  //       Number(department_id),
  //       Number(location_id),
  //       cader_id ? Number(cader_id) : null
  //     );
 
  //     return res.status(200).json({
  //       status: true,
  //       data: report,
  //       message: 'Attendance report retrieved successfully'
  //     });
  //   } catch (error) {
  //     const statusCode = error.status === false ? 400 : 500;
  //     return res.status(statusCode).json({
  //       status: false,
  //       message: error.message || 'Failed to fetch attendance report'
  //     });
  //   }
  // },


  // GetAttReportForDaySecondScreen: async (req, res) => {
  //   try {
  //     const {
  //       start_date,
  //       attendance_period,
  //       department_id,
  //       location_id,
  //       cader_id
  //     } = req.query;
 
  //     // Validate required fields
  //     if (!start_date || !attendance_period || !department_id ) {
  //       return res.status(400).json({
  //         status: false,
  //         message:
  //           'start_date, attendance_period, department_id are required'
  //       });
  //     }
 
  //     const report = await reportService.GetAttReportForDaySecondScreen(
  //       start_date,
  //       Number(attendance_period),
  //       Number(department_id),
  //       Number(location_id),
  //       cader_id ? Number(cader_id) : null
  //     );
 
  //     return res.status(200).json({
  //       status: true,
  //       data: report,
  //       message: 'Attendance report retrieved successfully'
  //     });
  //   } catch (error) {
  //     const statusCode = error.status === false ? 400 : 500;
  //     console.log(error)
  //     return res.status(statusCode).json({
  //       status: false,
  //       message: error.message || 'Failed to fetch attendance report'
  //     });
  //   }
  // },
  GetAttReportForDaySecondScreen: async (req, res) => {
    try {
      const {
        start_date,
        attendance_period,
        department_id,
        location_id,
        cader_id
      } = req.query;
  
      // Validate required
      if (!start_date || !attendance_period || !department_id ) {
        return res.status(400).json({
          status: false,
          message: 'start_date, attendance_period, department_id are required'
        });
      }
  
      // Convert or default to null
      const locId = location_id ? Number(location_id) : null;
      const cdrId = cader_id    ? Number(cader_id)    : null;
  
      console.log(
        `Fetching report for date: ${start_date}, period: ${attendance_period}, department: ${department_id}, location: ${locId}, cader: ${cdrId}`
      );
  
      const report = await reportService.GetAttReportForDaySecondScreen(
        start_date,
        Number(attendance_period),
        Number(department_id),
        locId,
        cdrId
      );
  
      return res.status(200).json({
        status: true,
        data: report,
        message: 'Attendance report retrieved successfully'
      });
    } catch (error) {
      const statusCode = error.status === false ? 400 : 500;
      console.log(error);
      return res.status(statusCode).json({
        status: false,
        message: error.message || 'Failed to fetch attendance report'
      });
    }
  },
  
  GetAttReportForWeekSecondScreen: async (req, res) => {
    try {
      const {
        start_date,
        department_id,
        attendance_period,
        location_id,
        cader_id,
      } = req.query;
  
      console.log(req.query);
  
      // Validate required fields
      if (!start_date || !department_id || !attendance_period) {
        return res.status(400).json({
          status: false,
          message: "start_date, department_id, and attendance_period are required",
        });
      }
  
      // Call the service with the parameters
      const result = await reportService.GetAttReportForWeekSecondScreen(
        start_date,
        department_id,
        attendance_period,
        location_id || null,
        cader_id || null
      );
  
      return res.status(200).json({
        status: true,
        data: result,
        message: "Attendance report retrieved successfully",
      });
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: error.message || "Something went wrong",
      });
    }
  },
  
  GetAttendanceReportForYearSecondScreen: async (req, res) => {
    try {
      const { year, department_id, attendance_period, location_id, cader_id } = req.query;
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
        location_id,
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
        month,         // e.g., '4'
        year,          // e.g., '2024'
        department_id,
        attendance_period,
        location_id,
        cader_id
      } = req.query;
  
      console.log(req.query);
  
      // Validate required fields
      if (!month || !year || !department_id || !attendance_period) {
        return res.status(400).json({
          status: false,
          message: "month, year, department_id, and attendance_period are required"
        });
      }
  
      // Call the service
      const result = await reportService.GetAttReportFormonthSecondScreen(
        parseInt(month),
        parseInt(year),
        parseInt(department_id),
        parseInt(attendance_period),
        location_id ? parseInt(location_id) : null,
        cader_id ? parseInt(cader_id) : null
      );
  
      return res.status(200).json({
        status: true,
        data: result,
        message: "Attendance report retrieved successfully"
      });
  
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: error.message || "Unexpected error occurred"
      });
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
    let {
      start_date = null,
      department_id = null,
      cader_id = null,
      attendance_period = null,
      location_id = null
    } = req.query;
 
    const result = await reportService.GetAttendanceReportForWeekDateForthScreen(
           start_date,
           department_id,
            location_id,
           cader_id,
           attendance_period
        );
console.log(result)
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
    const { start_date, department_id, location_id, attendance_period } = req.query;

    // Validate input
    if (!start_date || !department_id || !location_id || !attendance_period) {
      return res.status(400).json({
        status: false,
        message: "date, department_id, office_location_id, and attendance_period are required",
      });
    }

    const result = await reportService.GetAttendanceReportForDayThirdScreen(
      start_date,
      parseInt(department_id),
      parseInt(location_id),
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
},

GetAttendanceReportForDayForSanstha :async (req, res) => {
  try {
    const { start_date, attendance_period, department_id, location_type } = req.query;

    // Validate input
    if (!start_date || !attendance_period || !department_id || !location_type) {
      return res.status(400).json({
        status: false,
        message: "date, attendance_period, department_id, and location_type are required"
      });
    }

    const result = await reportService.GetAttendanceReportForDayForSanstha(
      start_date,
      parseInt(attendance_period),
      parseInt(department_id),
      location_type
    );

    return res.status(200).json({
      status: true,
      data: result,
      message: "Sanstha-wise attendance report retrieved successfully"
    });

  } catch (error) {
    console.error("Controller Error - GetAttendanceReportForDayForSanstha:", error);
    return res.status(400).json({
      status: false,
      message: error.message || "Something went wrong"
    });
  }
},

GetAttReportForMonthUserDetails: async (req, res) => {
  try {
    const { year, month, cader_id, location_id, attendance_period } =
      req.query;

    // Validate required query parameters
    if (!year || !month || !cader_id || !location_id || !attendance_period) {
      return res.status(400).json({
        status: false,
        message:
          "year, month, cader_id, location_id, and attendance_period are required",
      });
    }

    const result = await reportService.GetAttReportForMonthUserDetails(
      year,
      month,
      cader_id,
      location_id,
      attendance_period
    );

    return res.status(200).json({
      status: true,
      data: result,
      message: "Attendance report retrieved successfully",
    });
  } catch (error) {
    if (error.sqlState === "45000") {
      return res.status(400).json({
        status: false,
        message: error.sqlMessage,
      });
    }
    return res.status(500).json({
      status: false,
      message: error.message || "Error fetching attendance report",
    });
  }
},

GetWeeklyAttendanceByCader: async (req, res) => {
  const { start_date, department_id, cader_id, attendance_period, location_id } = req.query;

  console.log(req.query);

  if (!start_date || !department_id || !attendance_period) {
    return res.status(400).json({
      status: false,
      message: "start_date, department_id, and attendance_period are required"
    });
  }

  try {
    const data = await reportService.GetAttendanceReportForWeekCaderWise(
      start_date,
      parseInt(department_id),
      cader_id ? parseInt(cader_id) : null,
      parseInt(attendance_period),
      location_id !== undefined && location_id !== '' ? parseInt(location_id) : null
    );

    res.status(200).json({
      status: true,
      message: "Weekly attendance report fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Something went wrong",
    });
  }
},
GetWeeklyAttendanceBySanstha: async (req, res) => {
  const { start_date, attendance_period, department_id, location_id } = req.query;

  console.log("Query Params:", req.query);

  if (!start_date || !attendance_period || !department_id || !location_id) {
    return res.status(400).json({
      status: false,
      message: "start_date, attendance_period, department_id, and office_location_id are required",
    });
  }

  const validPeriods = [1, 2, 3];
  if (!validPeriods.includes(Number(attendance_period))) {
    return res.status(400).json({
      status: false,
      message: "Invalid attendance_period; must be 1 (Morning), 2 (Afternoon), or 3 (Full)",
    });
  }

  try {
    const data = await reportService.GetAttendanceReportForWeekSansthaWise(
      start_date,
      attendance_period,
      department_id,
      location_id
    );

    res.status(200).json({
      status: true,
      message: "Weekly attendance report (Sanstha-wise) fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching Sanstha-wise report:", error);
    res.status(500).json({
      status: false,
      message: error.message || "Something went wrong",
    });
  }
},

GetMonthlyAttendanceByCader: async (req, res) => {
  const { month, year, department_id, cader_id, attendance_period, location_id } = req.query;

  console.log("Monthly Params:", req.query);

  if (!month || !year || !department_id || !attendance_period) {
    return res.status(400).json({
      status: false,
      message: "month, year, department_id, and attendance_period are required"
    });
  }

  try {
    const data = await reportService.GetAttendanceReportForMonthCaderWise(
      month,
      year,
      department_id,
      cader_id,
      attendance_period,
      location_id
    );

    res.status(200).json({
      status: true,
      message: "Monthly attendance report fetched successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Something went wrong"
    });
  }
},


// show one user whole details with attendance shown on last report page

listAttendanceByUser: async (req, res) => {
  try {
    const { userId, data_status, date, month, year } = req.body;
    if (!userId || !data_status) {
      return res.status(400).json({
        status: false,
        message: "userId and data_status are required",
      });
    }

    const result = await reportService.listAttendanceByUser(userId, data_status, date, month, year);
    return res.status(result.status ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error in listAttendanceByUser controller:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to retrieve attendance data",
    });
  }
},

};
