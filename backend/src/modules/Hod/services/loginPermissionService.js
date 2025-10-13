import { query } from "../../../../utils/database.js";
import { decrypt, decryptDeterministic } from "../../../../utils/crypto.js";



export const loginPermission = {

    getUserForLoginPermissions: async (permitter_id) => {
        try {
            const fetchUsersQuery = "CALL getUserForLoginPermissions(?)";
            const [results] = await query(fetchUsersQuery, [permitter_id]);

            console.log(results)
    
            // const users = results[0] || results; // Handle stored proc result shape
    
            if (!results || results.length === 0) {
                return null;
            }
    
            return results.map(user => ({
                id: user.user_id,
                first_name: decrypt(user.first_name),
                middle_name: user.middle_name ? decrypt(user.middle_name) : null,
                last_name: decrypt(user.last_name),
                mob_no: decryptDeterministic(user.mob_no),
                email: user.email ? decrypt(user.email) : null,
                status: user.status,
                village_name: user.village_name,
                sanstha_name: user.sanstha_name,
                cader_name: user.cader_name,
                department_name: user.department_name,
            }));
        } catch (error) {
            console.error("Error in getUserForLoginPermissions:", error);
            throw { status: false, message: "Database error" };
        }
    },

//     getAllUsersByDepartment: async (department_id) => {
//     try {
//         const fetchUsersQuery = "CALL getAllUsersByDepartment(?)";
//         const [results] = await query(fetchUsersQuery, [department_id]);

//         if (!results || results.length === 0) {
//             return null;
//         }

//         return results.map(user => ({
//             id: user.user_id,
//             first_name: decrypt(user.first_name),
//             middle_name: user.middle_name ? decrypt(user.middle_name) : null,
//             last_name: decrypt(user.last_name),
//             mob_no: decryptDeterministic(user.mob_no),
//             email: user.email ? decrypt(user.email) : null,
//             status: user.status,
//             dept_id: user.dept_id,
//             dept_id: user.dept_id,
//             cader_id: user.cader_id,
//             village_id: user.village_id,
//             loc_id: user.loc_id,
//             village_name: user.village_name,
//             location_name: user.location_name,
//             cader_name: user.cader_name,
//             department_name: user.department_name,
//         }));
//     } catch (error) {
//         console.error("Error in getAllUsersByDepartment:", error);
//         throw { status: false, message: "Database error" };
//     }
// }

    
    getAllUsersByDepartment: async (department_id) => {
    try {
        const fetchUsersQuery = "CALL getAllUsersByDepartment(?)";
        const [results] = await query(fetchUsersQuery, [department_id]);

        if (!results || results.length === 0) {
            return null;
        }

        return results.map(user => ({
            user_id: user.user_id,
            first_name: decrypt(user.first_name),
            middle_name: user.middle_name ? decrypt(user.middle_name) : null,
            last_name: decrypt(user.last_name),
            mob_no: decryptDeterministic(user.mob_no),
            email: user.email ? decrypt(user.email) : null,
            birth_date: user.birth_date,
            department_id: user.department_id,
            office_location_id: user.loc_id,
            taluka_id: user.taluka_id,
            village_id: user.village_id,
            cader_id: user.cader_id,
            joining_date: user.joining_date,
            status: user.status,
            // village_name: user.village_name,
            location_name: user.location_name,
            cader_name: user.cader_name,
            department_name: user.department_name
        }));
    } catch (error) {
        console.error("Error in getAllUsersByDepartment:", error);
        throw { status: false, message: "Database error" };
    }
},

 getUsersByLocationAndDepartment: async (location_id, department_id) => {
    try {
      const [results] = await query("CALL getUsersByLocationAndDepartment(?, ?)", [
        location_id,
        department_id || null,
      ]);

      // Safely extract rows no matter what shape comes back
      let rows = [];

      if (Array.isArray(results)) {
        if (Array.isArray(results[0])) {
          rows = results[0];
        } else {
          rows = results;
        }
      } else if (results && typeof results === "object" && Array.isArray(results.rows)) {
        rows = results.rows;
      }

      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return [];
      }

      return rows.map((user) => ({
        user_id: user.user_id,
        first_name: decrypt(user.first_name),
        middle_name: user.middle_name ? decrypt(user.middle_name) : null,
        last_name: decrypt(user.last_name),
        mob_no: decryptDeterministic(user.mob_no),
        email: user.email ? decrypt(user.email) : null,
        birth_date: user.birth_date,
        department_id: user.department_id,
        office_location_id: user.loc_id,
        taluka_id: user.taluka_id,
        village_id: user.village_id,
        cader_id: user.cader_id,
        joining_date: user.joining_date,
        status: user.status,
        location_name: user.location_name,
        cader_name: user.cader_name,
        department_name: user.department_name,
      }));
    } catch (error) {
      console.error("Error in getUsersByLocationAndDepartment:", error);
      throw error;
    }
  },
};