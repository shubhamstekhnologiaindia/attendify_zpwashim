import moment from "moment-timezone";
import { AttendanceService } from "../services/attendanceService.js";
import { getEpochTime } from "../../../../utils/epochTime.js";



const convertEpochToIST = (epochTime) => {
  if (!epochTime || epochTime == "0") return null;
  return moment
    .unix(epochTime)
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD HH:mm:ss");
};
// helper function
const calculateWorkingHours = (
  att_morning_in_time,
  att_afternoon_in_time,
  att_out_time
) => {
  if (!att_out_time) return "00:00:00";

  let inTime = att_morning_in_time || att_afternoon_in_time;
  if (!inTime) return "00:00:00";

  let startTime = moment.unix(inTime);
  let endTime = moment.unix(att_out_time);

  let duration = moment.duration(endTime.diff(startTime));

  let hours = String(Math.floor(duration.asHours())).padStart(2, "0");
  let minutes = String(duration.minutes()).padStart(2, "0");
  let seconds = String(duration.seconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export const AttendanceController = {
  recordAttendance: async (req, res) => {
    try {
      const { user_id, in_out_id } = req.body;

      if (!user_id || !in_out_id) {
        return res.status(400).json({ status: false, message: "user_id and inOutId are required" });
      }

      // Generate current IST time (UTC + 5:30)
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const istTime = new Date(Date.now() + istOffset)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19); // 'YYYY-MM-DD HH:mm:ss'

      const result = await AttendanceService.recordAttendance(user_id, in_out_id, istTime);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  },
  

  getUserAttendance: async (req, res) => {
    try {
      const { employee_id } = req.params;
      if (!employee_id) {
        return res.status(400).json({ error: "Employee ID is required" });
      }

      const attendanceData = await AttendanceService.getUserAttendance(
        employee_id
      );
      if (!attendanceData?.length) {
        return res.status(404).json({ message: "No attendance records found" });
      }

      const formattedData = attendanceData.map((record) => {
        const att_morning_in_time = record.att_morning_in_time
          ? record.att_morning_in_time
          : null;
        const att_afternoon_in_time = record.att_afternoon_in_time
          ? record.att_afternoon_in_time
          : null;
        const att_out_time = record.att_out_time ? record.att_out_time : null;

        return {
          attendance_date:
            record.attendance_date ||
            moment().tz("Asia/Kolkata").format("YYYY-MM-DD"),
          att_morning_in_time: convertEpochToIST(att_morning_in_time),
          att_afternoon_in_time: convertEpochToIST(att_afternoon_in_time),
          att_out_time: convertEpochToIST(att_out_time),
          total_working_hours: calculateWorkingHours(
            att_morning_in_time,
            att_afternoon_in_time,
            att_out_time
          ),
        };
      });

      res.status(200).json({
        success: true,
        message: "Attendance records fetched successfully",
        data: formattedData,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  },

  // recordOfflineAttendance: async (req, res) => {
  //   try {
  //     const { user_id, attendance } = req.body;
  
  //     // Validate required fields
  //     if (!user_id || !attendance || typeof attendance !== 'object') {
  //       return res.status(400).json({ status: false, message: "user_id and attendance object are required" });
  //     }
  
  //     // Call the correct service function
  //     const result = await AttendanceService.recordOfflineAttendance(user_id, attendance);
  //     return res.status(200).json(result);
  //   } catch (error) {
  //     return res.status(500).json({ status: false, message: error.message });
  //   }
  // },


  recordOfflineAttendance :async (req, res) => {
    const { user_id, attendance } = req.body;
    const { morning_in_time, afternoon_in_time, out_time } = attendance;


    console.log(user_id)
  
    if (!user_id || (!morning_in_time && !afternoon_in_time && !out_time)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
  
    console.log( morning_in_time, afternoon_in_time, out_time )

    try {
      const result = await AttendanceService.recordOfflineAttendance(
        user_id,
        morning_in_time,
        afternoon_in_time,
        out_time
      );
      res.status(200).json({ message: 'Attendance managed successfully', data: result });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while managing attendance' });
    }

  },






}
