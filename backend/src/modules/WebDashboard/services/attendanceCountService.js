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


  // add code for on dashboard show user count ps and hq


  getHQCountsFilteredByDepartment: async (departmentId) => {
  const officeLocationId = 1;

  const [hqResult] = await query(
    "SELECT COUNT(*) AS count FROM users WHERE office_location_id = 1 AND department_id = ? AND status = 1",
    [departmentId]
  );

  const [attendanceCounts] = await query(
    "CALL GetAttendanceCountByDept(?, ?)",
    [officeLocationId, departmentId]
  );

  const hqAttendance = attendanceCounts[0];

  return [
    {
      title: "HQ Department Attendance",
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

getDistrictCountsFilteredByDepartment: async (departmentId) => {
  const officeLocationId = 2;

  const [districtResult] = await query(
    "SELECT COUNT(*) AS count FROM users WHERE office_location_id != 1 AND department_id = ? AND status = 1",
    [departmentId]
  );

  const [attendanceCounts] = await query(
    "CALL GetAttendanceCountByDept(?, ?)",
    [officeLocationId, departmentId]
  );

  const districtAttendance = attendanceCounts[0];

  return [
    {
      title: "District Department Attendance",
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
// getUserAttendanceList: async (locationId) => {
//   const rows = await query("CALL get_today_user_attendance_list(?)", [locationId]);

//   const decryptedRows = rows[0].map(row => ({
//     ...row,
//     first_name: decrypt(row.first_name),
//     middle_name: decrypt(row.middle_name),
//     last_name: decrypt(row.last_name),
//     mob_no: decryptDeterministic(row.mob_no),
//   }));

//   return decryptedRows;
// },
// getUserAttendanceListForDistrict: async (locationId) => {
//   const rows = await query("CALL get_today_user_attendance_list(?)", [locationId]);

//   const decryptedRows = rows[0].map(row => ({
//     ...row,
//     first_name: decrypt(row.first_name),
//     middle_name: decrypt(row.middle_name),
//     last_name: decrypt(row.last_name),
//     mob_no: decryptDeterministic(row.mob_no),
//   }));

//   return decryptedRows;
// },

getUserAttendanceListHQ: async () => {
  const locationId = 1; // Hardcoded for HQ
  const rows = await query("CALL get_today_user_attendance_list_all(?)", [locationId]);

  const decryptedRows = rows[0].map(row => ({
    ...row,
    first_name: decrypt(row.first_name),
    middle_name: decrypt(row.middle_name),
    last_name: decrypt(row.last_name),
    mob_no: decryptDeterministic(row.mob_no),
  }));

  return decryptedRows;
},

getUserAttendanceListDistrict: async () => {
  const locationId = 2; // Any value != 1 for District
  const rows = await query("CALL get_today_user_attendance_list_all(?)", [locationId]);

  const decryptedRows = rows[0].map(row => ({
    ...row,
    first_name: decrypt(row.first_name),
    middle_name: decrypt(row.middle_name),
    last_name: decrypt(row.last_name),
    mob_no: decryptDeterministic(row.mob_no),
  }));

  return decryptedRows;
},
// getUserAttendanceListDepartmentHQ: async (departmentId) => {
//   const locationId = 1; // HQ
//   const rows = await query("CALL get_today_user_attendance_list_By_Department(?, ?)", [locationId, departmentId]);

//   const decryptedRows = rows[0].map(row => ({
//     ...row,
//     first_name: decrypt(row.first_name),
//     middle_name: decrypt(row.middle_name),
//     last_name: decrypt(row.last_name),
//     mob_no: decryptDeterministic(row.mob_no),
//   }));

//   return decryptedRows;
// },
getUserAttendanceListHQ: async (departmentId) => {
  const locationId = 1; // fixed for HQ

  const rows = await query("CALL get_today_user_attendance_list_By_Departments(?, ?)", [locationId, departmentId]);

  const decryptedRows = rows[0].map(row => ({
    ...row,
    first_name: decrypt(row.first_name),
    middle_name: decrypt(row.middle_name),
    last_name: decrypt(row.last_name),
    mob_no: decryptDeterministic(row.mob_no),
  }));

  return decryptedRows;
}
,
getUserAttendanceListDistrictByDepartment: async (departmentId) => {
  const locationId = 2; // District
  const rows = await query("CALL get_today_user_attendance_list_By_Departments(?, ?)", [locationId, departmentId]);

  const decryptedRows = rows[0].map(row => ({
    ...row,
    first_name: decrypt(row.first_name),
    middle_name: decrypt(row.middle_name),
    last_name: decrypt(row.last_name),
    mob_no: decryptDeterministic(row.mob_no),
  }));

  return decryptedRows;
}


};

