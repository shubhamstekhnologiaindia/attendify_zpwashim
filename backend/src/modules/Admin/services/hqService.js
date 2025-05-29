import dotenv from "dotenv";
import moment from "moment-timezone";
import { query } from "../../../../utils/database.js";
dotenv.config();
import path from 'path';
import { decrypt, decryptDeterministic,encrypt } from "../../../../utils/crypto.js"; // Import decryption functions

export const HeadquarterService = {
    
    // FetchHOD: async () => {
    //     try {
    //         const sql = "CALL FetchHODs()";
    //         const [results] = await query(sql);

    //         console.log(results);

    //         const decryptedResults = results.map(hod => ({
    //             user_id: hod.user_id,
    //             full_name: `${decrypt(hod.first_name)} ${decrypt(hod.middle_name)} ${decrypt(hod.last_name)}`.trim(),
    //             mob_no: decryptDeterministic(hod.mob_no),
    //             email: decrypt(hod.email),
    //             department_name: hod.department_name,
    //             taluka_name: hod.taluka_name
    //         }));

    //         return decryptedResults;
    //     } catch (error) {
    //         console.error("Error fetching HOD details:", error);
    //         throw new Error("Error fetching HOD details");
    //     }
    // }


    FetchHOD: async () => {
        try {
          const sql = `
               SELECT 
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.mob_no,
        d.department_name,
        c.cader_name,
        u.reports_permission_status
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN tbl_cader c ON u.cader_id = c.id
      WHERE u.role_id = 102
    `; 
          const users = await query(sql);
    
          // Decrypt fields and construct full_name
          return users.map((user) => ({
            user_id: user.user_id,
            full_name: user.first_name && user.last_name 
              ? `${decrypt(user.first_name)} ${decrypt(user.last_name)}`
              : null,
            department_name: user.department_name,
            cader_name: user.cader_name,
            mob_no: user.mob_no ? decryptDeterministic(user.mob_no) : null,
            reports_permission_status: user.reports_permission_status,
          }));
        } catch (error) {
          console.error("Error in listRole102Users service:", error);
          throw new Error("Failed to retrieve users");
        }
      },
}
    




