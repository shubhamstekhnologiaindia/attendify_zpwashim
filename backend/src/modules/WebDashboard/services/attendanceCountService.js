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

  // getUserCountsForDistrict: async () => {
  //   const officeLocationId = 2;

  //   const [districtResult] = await query(
  //     "SELECT COUNT(*) AS count FROM users WHERE office_location_id != 1 AND status = 1"
  //   );
  //   const [attendanceCounts] = await query(
  //     "CALL GetAttendanceCountHQAndDistrict(?)",
  //     [officeLocationId]
  //   );

  //   const districtAttendance = attendanceCounts[0];

  //   return [
  //     {
  //       title: "District Attendance",
  //       district_count: districtResult.count,
  //       total: 10,
  //       working: districtAttendance.total_users,
  //       late_count: districtAttendance.morning_late_count,
  //       morning_present: districtAttendance.morning_present_count,
  //       morning_absent: districtAttendance.morning_absent_count,
  //       afternoon_present: districtAttendance.afternoon_present_count,
  //       afternoon_absent: districtAttendance.afternoon_absent_count,
  //       evening_present: districtAttendance.evening_present_count,
  //       evening_absent: districtAttendance.evening_absent_count,
  //     },
  //   ];
  // },


  // add code for on dashboard show user count ps and hq

getUserCountsForDistrict: async () => {
  const officeLocationId = 2;
  const [attendanceCounts] = await query(
    "CALL GetAttendanceCountHQAndDistrict(?)",
    [officeLocationId]
  );

  // Find rows for each level
  const panchayatRow = attendanceCounts.find(row => row.level_name === 'Panchayat Samiti');
  const gramRow = attendanceCounts.find(row => row.level_name === 'Gram Panchayat');

  // Default to empty objects if rows not found
  const panchayatData = panchayatRow || {
    total_users: 0,
    morning_present_count: 0,
    morning_absent_count: 0,
    morning_late_count: 0,
    afternoon_present_count: 0,
    afternoon_absent_count: 0,
    evening_present_count: 0,
    evening_absent_count: 0
  };

  const gramData = gramRow || {
    total_users: 0,
    morning_present_count: 0,
    morning_absent_count: 0,
    morning_late_count: 0,
    afternoon_present_count: 0,
    afternoon_absent_count: 0,
    evening_present_count: 0,
    evening_absent_count: 0
  };

  const data = [
    {
      title: "District Attendance",
      district_count: panchayatData.total_users,
      morning_present: panchayatData.morning_present_count,
      morning_absent: panchayatData.morning_absent_count,
      late_count: panchayatData.morning_late_count,
      afternoon_present: panchayatData.afternoon_present_count,
      afternoon_absent: panchayatData.afternoon_absent_count,
      evening_present: panchayatData.evening_present_count,
      evening_absent: panchayatData.evening_absent_count
    },
    {
      title: "Gram Panchayat Attendance",
      grampanchayat_count: gramData.total_users,
      morning_present: gramData.morning_present_count,
      morning_absent: gramData.morning_absent_count,
      late_count: gramData.morning_late_count,
      afternoon_present: gramData.afternoon_present_count,
      afternoon_absent: gramData.afternoon_absent_count,
      evening_present: gramData.evening_present_count,
      evening_absent: gramData.evening_absent_count
    }
  ];

  return {
    success: true,
    message: "Attendance counts fetched successfully",
    data: data
  };
},
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
  getUserAttendanceListHQDepartment: async (departmentId) => {
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
  },

  getUserSpecificDateAttendanceDepartment: async (department_id, date, cader_id) => {

    const rows = await query("CALL get_user_attendance_report_by_departments(?, ?, ?)", [department_id, date, cader_id]);

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

