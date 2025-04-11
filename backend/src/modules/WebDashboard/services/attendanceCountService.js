import { query } from "../../../../utils/database.js";
import {
  decrypt,
  decryptDeterministic,
  encrypt,
  encryptDeterministic,
} from "../../../../utils/crypto.js";

export const AttendanceCountService = {
  getUserCountsForHQ: async () => {
    const officeLocationId = 1;
    const [hqResult] = await query(
      "SELECT COUNT(*) AS count FROM users WHERE office_location_id = 1  "
    );

    const [attendanceCounts] = await query(
      "CALL GetAttendanceCountHQAndDistrict(?)",
      [officeLocationId]
    );
    const hqAttendance = attendanceCounts[0];

    return [
      {
        title: "Headquarter Attendance",
        headquarter_count: hqResult.count,
        total: 400,
        working: hqAttendance.total_users,
        late_count: hqAttendance.morning_late_count,
        morning_present: hqAttendance.morning_present_count,
        morning_absent: hqAttendance.morning_absent_count,
        afternoon_present: hqAttendance.afternoon_present_count,
        afternoon_absent: hqAttendance.afternoon_absent_count,
        evening_present: hqAttendance.evening_present_count,
        evening_absent: hqAttendance.evening_absent_count,
      },
    ];
  },

  getUserCountsForDistrict: async () => {
    const officeLocationId = 2; 

    const [districtResult] = await query(
      "SELECT COUNT(*) AS count FROM users WHERE office_location_id != 1 AND status = 1"
    );
    const [attendanceCounts] = await query(
      "CALL GetAttendanceCountHQAndDistrict(?)",
      [officeLocationId]
    );

    const districtAttendance = attendanceCounts[0];

    return [
      {
        title: "District Attendance",
        district_count: districtResult.count,
        total: 10,
        working: districtAttendance.total_users,
        late_count: districtAttendance.morning_late_count,
        morning_present: districtAttendance.morning_present_count,
        morning_absent: districtAttendance.morning_absent_count,
        afternoon_present: districtAttendance.afternoon_present_count,
        afternoon_absent: districtAttendance.afternoon_absent_count,
        evening_present: districtAttendance.evening_present_count,
        evening_absent: districtAttendance.evening_absent_count,
      },
    ];
  },
};
