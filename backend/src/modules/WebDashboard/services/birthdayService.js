import { query } from "../../../../utils/database.js";
import moment from "moment-timezone";
import { decrypt, decryptDeterministic } from "../../../../utils/crypto.js";
 
export const BirthdayService = {
    getTodaysBirthdays : async () => {
        const today = moment().format("MM-DD");
 
        const sql = `
            SELECT id, first_name, middle_name, last_name, birth_date,user_profile
            FROM users
            WHERE status = 1 AND DATE_FORMAT(birth_date, '%m-%d') = ?
        `;
 
        const results = await query(sql, [today]);
 
        return results.map(user => {
            const firstName = decrypt(user.first_name);
            const middleName = user.middle_name ? decrypt(user.middle_name) : "";
            const lastName = decrypt(user.last_name);
 
            const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
 
            return {
                id: user.id,
                full_name: fullName,
                birth_date: moment(user.birth_date).format("YYYY-MM-DD"),
                user_profile: user.user_profile ? `${user.user_profile.replace(/\\/g, "/")}` : null

            };
        });
    }
};
 