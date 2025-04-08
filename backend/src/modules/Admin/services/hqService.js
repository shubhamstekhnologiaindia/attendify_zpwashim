import dotenv from "dotenv";
import moment from "moment-timezone";
import { query } from "../../../../utils/database.js";
dotenv.config();
import path from 'path';
import { decrypt, decryptDeterministic,encrypt } from "../../../../utils/crypto.js"; // Import decryption functions

export const HeadquarterService = {
    
    FetchHOD: async () => {
        try {
            const sql = "CALL FetchHODs()";
            const [results] = await query(sql);

            console.log(results);

            const decryptedResults = results.map(hod => ({
                user_id: hod.user_id,
                full_name: `${decrypt(hod.first_name)} ${decrypt(hod.middle_name)} ${decrypt(hod.last_name)}`.trim(),
                mob_no: decryptDeterministic(hod.mob_no),
                email: decrypt(hod.email),
                department_name: hod.department_name,
                taluka_name: hod.taluka_name
            }));

            return decryptedResults;
        } catch (error) {
            console.error("Error fetching HOD details:", error);
            throw new Error("Error fetching HOD details");
        }
    }}
    




