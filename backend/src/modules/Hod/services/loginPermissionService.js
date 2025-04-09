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
    }
    
    
};