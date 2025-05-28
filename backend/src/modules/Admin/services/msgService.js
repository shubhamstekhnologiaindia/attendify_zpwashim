import dotenv from "dotenv";
import moment from "moment-timezone";
import { query } from "../../../../utils/database.js";

dotenv.config();
import path from 'path';

export const MsgService1 = {
  SendMsg: async (allEmployees, departmentIds, zpIds, villageIds, officeLocationIds, caderIds, sansthIds) => {

    let FetchPhoneNoQuery = "SELECT mob_no FROM users";
    let params = [];

    if (allEmployees !== "1") {
      FetchPhoneNoQuery += " WHERE 1=1";

      if (officeLocationIds.length) {
        FetchPhoneNoQuery += ` AND office_location_id IN (${officeLocationIds.map(() => "?").join(",")})`;
        params.push(...officeLocationIds);
      }

      if (caderIds.length) {
        FetchPhoneNoQuery += ` AND cader_id IN (${caderIds.map(() => "?").join(",")})`;
        params.push(...caderIds);
      }

      if (departmentIds.length) {
        FetchPhoneNoQuery += ` AND department_id IN (${departmentIds.map(() => "?").join(",")})`;
        params.push(...departmentIds);
      }
      
      if (zpIds.length) {
        FetchPhoneNoQuery += ` AND taluka_id IN (${zpIds.map(() => "?").join(",")})`;
        params.push(...zpIds);
      }
      
      if (villageIds.length) {
        FetchPhoneNoQuery += ` AND village_id IN (${villageIds.map(() => "?").join(",")})`;
        params.push(...villageIds);
      }
      if (sansthIds.length) {
        FetchPhoneNoQuery += ` AND user_sanstha_id IN (${sansthIds.map(() => "?").join(",")})`;
        params.push(...sansthIds);
      }
    }
    console.log(FetchPhoneNoQuery);
    const rows = await query(FetchPhoneNoQuery, params);
    console.log(rows);
    return rows.map((row) => row.mob_no);
  }
};

