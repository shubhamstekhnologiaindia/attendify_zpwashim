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
      const { user_id, in_out_id, location_lat, location_lon } = req.body;

      if (!user_id || !in_out_id ) {
        return res.status(400).json({ status: false, message: "user_id and inOutId are required" });
      }

      // Generate current IST time (UTC + 5:30)
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const istTime = new Date(Date.now() + istOffset)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19); // 'YYYY-MM-DD HH:mm:ss'

      const result = await AttendanceService.recordAttendance(user_id, in_out_id, istTime,location_lat, location_lon);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  },
  

  getUserAttendance: async (req, res) => {
    try {
        const { employee_id } = req.params;

        if (!employee_id || isNaN(employee_id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid employee_id is required'
            });
        }

        const { field_status, attendanceData } = await AttendanceService.getUserAttendance(employee_id);

        res.status(200).json({
            success: true,
            message: attendanceData.length ? 'Attendance records fetched successfully' : 'Attendance records not found',
            field_status,
            data: attendanceData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error.message
        });
    }
},




  recordOfflineAttendance: async (req, res) => {
    try {
      const { user_id, morning_in_time,morning_lat,morning_lon, afternoon_in_time,afternoon_lat,afternoon_lon, out_time,out_lat,out_lon } = req.body;



      if (!user_id) {
        return res.status(400).json({ status: false, message: "user_id is required" });
      }

      const result = await AttendanceService.recordOfflineAttendance(
        user_id,
        morning_in_time,
        morning_lat,morning_lon,
        afternoon_in_time,
        afternoon_lat,afternoon_lon,
        out_time,
        out_lat,out_lon
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  },

}
