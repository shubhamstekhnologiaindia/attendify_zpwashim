import { query } from "../../../../utils/database.js";
export const FieldVisitService = {
    createFieldVisit: async (fieldVisitData) => {
        try {
            const { user_id, subject, message, location, loc_coordinates } = fieldVisitData;

            // Check if user exists (assuming user_id should exist in users table)
            const checkUserSql = `SELECT id FROM users WHERE id = ? LIMIT 1`;
            const existingUser = await query(checkUserSql, [user_id]);

            if (existingUser.length === 0) {
                throw new Error('User does not exist');
            }

            // Insert field visit with plain text data
            const sql = `
                INSERT INTO tbl_field_visit 
                (user_id, subject, message, location, loc_coordinates)
                VALUES (?, ?, ?, ?, ?)
            `;
            const values = [
                user_id,
                subject,
                message || null,
                location || null,
                loc_coordinates || null
            ];

            const results = await query(sql, values);

            return {
                success: true,
                data: {
                    id: results.insertId,
                    user_id,
                    subject,
                    message,
                    location,
                    loc_coordinates
                }
            };
        } catch (error) {
            console.error('Error in createFieldVisit service:', error);
            throw new Error(`Failed to create field visit: ${error.message}`);
        }
    }
};