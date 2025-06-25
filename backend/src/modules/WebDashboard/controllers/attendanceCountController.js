import moment from "moment-timezone";
import { AttendanceCountService } from "../services/attendanceCountService.js";
import { getEpochTime } from "../../../../utils/epochTime.js";



export const AttendanceCountController = {

    getUserHQCounts: async (req, res) => {
        try {
          // Call the service that fetches all location-based counts
          const counts = await AttendanceCountService.getUserCountsForHQ();
      
          // Respond with the data
          return res.status(200).json({
            success: true,
            message: "User attendance counts fetched successfully",
            data: counts
          });
      
        } catch (error) {
          // In case of error, return 500
          console.error("Error in getUserLocationCounts:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch user counts",
            error: error.message
          });
        }
      },

    getUserDistrictCounts: async (req, res) => {
        try {
          const counts = await AttendanceCountService.getUserCountsForDistrict();
      
          return res.status(200).json({
            success: true,
            message: "District user attendance counts fetched successfully",
            data: counts
          });
      
        } catch (error) {
          console.error("Error in getUserDistrictCounts:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch district user counts",
            error: error.message
          });
        }
      },
    getHQCountsByDepartment: async (req, res) => {
  try {
    const { department_id } = req.query;

    if (!department_id) {
      return res.status(400).json({ success: false, message: "department_id is required" });
    }

    const counts = await AttendanceCountService.getHQCountsFilteredByDepartment(parseInt(department_id));

    return res.status(200).json({
      success: true,
      message: "HQ user attendance counts by department fetched successfully",
      data: counts
    });

  } catch (error) {
    console.error("Error in getHQCountsByDepartment:", error);
    return res.status(500).json({ success: false, message: "Failed", error: error.message });
  }
      },

    getDistrictCountsByDepartment: async (req, res) => {
      try {
        const { department_id } = req.query;

        if (!department_id) {
          return res.status(400).json({ success: false, message: "department_id is required" });
        }

        const counts = await AttendanceCountService.getDistrictCountsFilteredByDepartment(parseInt(department_id));

        return res.status(200).json({
          success: true,
          message: "District user attendance counts by department fetched successfully",
          data: counts
        });

      } catch (error) {
        console.error("Error in getDistrictCountsByDepartment:", error);
        return res.status(500).json({ success: false, message: "Failed", error: error.message });
      }
    },

    getUserAttendanceListHQ: async (req, res) => {
      try {
        const data = await AttendanceCountService.getUserAttendanceListHQ();
        return res.status(200).json({
          success: true,
          message: "HQ user attendance list fetched successfully",
          data: data,
        });
      } catch (error) {
        console.error("Error in getUserAttendanceListHQ:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch HQ attendance list",
          error: error.message,
        });
      }
    },

    getUserAttendanceListDistrict: async (req, res) => {
      try {
        const data = await AttendanceCountService.getUserAttendanceListDistrict();
        return res.status(200).json({
          success: true,
          message: "District user attendance list fetched successfully",
          data: data,
        });
      } catch (error) {
        console.error("Error in getUserAttendanceListDistrict:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch district attendance list",
          error: error.message,
        });
      }
    },
   
    // getUserListHQByDepartment: async (req, res) => {
    //   const { department_id } = req.query;
    //   if (!department_id) {
    //     return res.status(400).json({ success: false, message: "department_id is required" });
    //   }

    //   try {
    //     const data = await AttendanceCountService.getUserAttendanceListHQ(parseInt(department_id));
    //     return res.status(200).json({ success: true, data });
    //   } catch (error) {
    //     console.error("Error:", error);
    //     return res.status(500).json({ success: false, message: error.message });
    //   }
    // },
getUserListHQByDepartment: async (req, res) => {
  const { department_id } = req.query;

  if (!department_id) {
    return res.status(400).json({ success: false, message: "department_id is required" });
  }

  try {
    const data = await AttendanceCountService.getUserAttendanceListHQDepartment(parseInt(department_id));
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
},
  getUserListDistrictByDepartment: async (req, res) => {
  const { department_id } = req.query;
  if (!department_id) {
    return res.status(400).json({ success: false, message: "department_id is required" });
  }

  try {
    const data = await AttendanceCountService.getUserAttendanceListDistrictByDepartment(parseInt(department_id));
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
},

getUserAttendanceByDepartment: async (req, res) => {
  const { department_id, date } = req.query;

  if (!department_id || !date) {
    return res.status(400).json({ success: false, message: "department_id and date is required" });
  }

  try {
    console.log()
    const data = await AttendanceCountService.getUserSpecificDateAttendanceDepartment(parseInt(department_id), date);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
},



};
