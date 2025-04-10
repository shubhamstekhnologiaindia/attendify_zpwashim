import { query } from "../../../../utils/database.js"; 
import { decrypt, decryptDeterministic,encrypt,encryptDeterministic } from "../../../../utils/crypto.js"; 

export const AttendanceCountService = {

      // getUserCountsForHQ: async () => {
      //   try {
      //     const officeLocationId = 1; // <-- ✅ Define the location ID for HQ

      //     // Total HQ users (regardless of status)
      //     const [hqResult] = await query("SELECT COUNT(*) AS count FROM users WHERE office_location_id = 1");
      
      //     // Call SP for attendance counts
      //     // const [attendanceCounts] = await query("CALL sp_get_hq_attendance_counts()");
      //     const [attendanceCounts] = await query("CALL sp_get_attendance_counts_by_location(?)", [officeLocationId]);

      //     const hqAttendance = attendanceCounts[0];
      
      //     const result = {
      //       title: "Headquarter Attendance",
      //       hq_total_users_from_users_table: hqResult.count,
      //       total:400,
      //       working: hqAttendance.total_users,  
      //       // Morning
      //       morning_present: hqAttendance.morning_present_count,
      //       morning_absent: hqAttendance.morning_absent_count,
      
      //       // Afternoon
       
      //       afternoon_present: hqAttendance.afternoon_present_count,
      //       afternoon_absent: hqAttendance.afternoon_absent_count,
      
      //       // Evening
           
      //       evening_present: hqAttendance.evening_present_count,
      //       evening_absent: hqAttendance.evening_absent_count
      //     };
      
      //     return [result];
      
      //   } catch (err) {
      //     console.error("Error fetching HQ attendance counts:", err);
      //     throw err;
      //   }
      // },

      getUserCountsForHQ: async () => {
        const officeLocationId = 1;
        const [hqResult] = await query("SELECT COUNT(*) AS count FROM users WHERE office_location_id = 1  ");
      
        const [attendanceCounts] = await query("CALL sp_get_attendance_counts_by_location(?)", [officeLocationId]);
        const hqAttendance = attendanceCounts[0];
      
        return [{
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
          evening_absent: hqAttendance.evening_absent_count
        }];
      },
      

      getUserCountsForDistrict: async () => {
        const officeLocationId = 2; // any non-HQ ID will trigger district logic
      
        const [districtResult] = await query("SELECT COUNT(*) AS count FROM users WHERE office_location_id != 1 AND status = 1");
        const [attendanceCounts] = await query("CALL sp_get_attendance_counts_by_location(?)", [officeLocationId]);
      
        const districtAttendance = attendanceCounts[0];
      
        return [{
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
          evening_absent: districtAttendance.evening_absent_count
        }];
      },
      

      // getUserCountsForDistrict: async () => {
      //   try {
      //     const officeLocationId = 2; // Any value other than 1; used for calling SP
      
      //     // Get users not in HQ (i.e., district users)
      //     const [districtResult] = await query(
      //       "SELECT COUNT(*) AS count FROM users WHERE office_location_id != 1 AND status = 1"
      //     );
      
      //     // Call stored procedure with a non-HQ office location id
      //     const [attendanceCounts] = await query("CALL sp_get_attendance_counts_by_location(?)", [officeLocationId]);
      
      //     const districtAttendance = attendanceCounts[0];
      
      //     const result = {
      //       title: "District Attendance",
      //       district_total_users_from_users_table: districtResult.count,
      //       total: 300,
      //       working: districtAttendance.total_users,
      
      //       // Morning
      //       morning_present: districtAttendance.morning_present_count,
      //       morning_absent: districtAttendance.morning_absent_count,
      
      //       // Afternoon
      //       afternoon_present: districtAttendance.afternoon_present_count,
      //       afternoon_absent: districtAttendance.afternoon_absent_count,
      
      //       // Evening
      //       evening_present: districtAttendance.evening_present_count,
      //       evening_absent: districtAttendance.evening_absent_count
      //     };
      
      //     return [result];
      
      //   } catch (err) {
      //     console.error("Error fetching District attendance counts:", err);
      //     throw err;
      //   }
      // }
        
//     getUserCountsForDistrict: async () => {
//   try {
//     const officeLocationId = 1; // <-- ✅ Define the location ID for HQ

//     const [districtResult] = await query("SELECT COUNT(*) AS count FROM users WHERE office_location_id =!1 AND status = 1");

//     const [attendanceCounts] = await query("CALL sp_get_attendance_counts_by_location(?)", [officeLocationId]);
//     const districtAttendance = attendanceCounts[0];

//     const result = {
//       title: "District Attendance",
//       district_total_users_from_users_table: districtResult.count,
//       total: 300, // Optional static value
//       working: districtAttendance.total_users,

//       // Morning
//       morning_present: districtAttendance.morning_present_count,
//       morning_absent: districtAttendance.morning_absent_count,

//       // Afternoon
//       afternoon_present: districtAttendance.afternoon_present_count,
//       afternoon_absent: districtAttendance.afternoon_absent_count,

//       // Evening
//       evening_present: districtAttendance.evening_present_count,
//       evening_absent: districtAttendance.evening_absent_count
//     };

//     return [result];

//   } catch (err) {
//     console.error("Error fetching District attendance counts:", err);
//     throw err;
//   }
// }

// CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_attendance_counts_by_location`(
//   IN officeLocationId INT
// )
// BEGIN
//   SELECT 
//       COUNT(u.id) AS total_users,

//       -- Morning
//       SUM(CASE 
//           WHEN ar.att_morning_in_time IS NOT NULL THEN 1 
//           ELSE 0 
//       END) AS morning_present_count,

//       SUM(CASE 
//           WHEN ar.att_morning_in_time IS NULL THEN 1 
//           ELSE 0 
//       END) AS morning_absent_count,

//       -- Afternoon
//       SUM(CASE 
//           WHEN ar.att_afternoon_in_time IS NOT NULL THEN 1 
//           ELSE 0 
//       END) AS afternoon_present_count,

//       SUM(CASE 
//           WHEN ar.att_afternoon_in_time IS NULL THEN 1 
//           ELSE 0 
//       END) AS afternoon_absent_count,

//       -- Evening
//       SUM(CASE 
//           WHEN ar.att_out_time IS NOT NULL THEN 1 
//           ELSE 0 
//       END) AS evening_present_count,

//       SUM(CASE 
//           WHEN ar.att_out_time IS NULL THEN 1 
//           ELSE 0 
//       END) AS evening_absent_count

//   FROM users u
//   LEFT JOIN (
//       SELECT *
//       FROM tbl_attendance_records ar1
//       WHERE DATE(ar1.att_ist_date) = CURDATE()
//         AND ar1.att_record_id = (
//             SELECT MAX(ar2.att_record_id)
//             FROM tbl_attendance_records ar2
//             WHERE ar2.att_employee_id = ar1.att_employee_id
//               AND DATE(ar2.att_ist_date) = CURDATE()
//         )
//   ) ar ON u.id = ar.att_employee_id

//   WHERE 
//     (
//       -- For HQ: show all users in office_location_id = 1
//       (officeLocationId = 1 AND u.office_location_id = 1)

//       -- For Districts: show all users not in HQ and who are active
//       OR (officeLocationId != 1 AND u.office_location_id != 1 AND u.status = 1)
//     );
// END
      
}
