import { query } from "../../../../utils/database.js";
import moment from "moment-timezone";

export const HolidayService = {
    getUpcomingHoliday: async () => {
        const today = moment().format("YYYY-MM-DD");
        const sql = `
            SELECT id, holiday_name_mr, holiday_name_eng, holiday_date
            FROM holidays
            WHERE holiday_date >= ?
            ORDER BY holiday_date ASC
            LIMIT 1
        `;

        const results = await query(sql, [today]);

        if (results.length === 0) return null;

        return results.map(holiday => ({
            id: holiday.id,
            date: moment(holiday.holiday_date).format("YYYY-MM-DD"),
            name_english: holiday.holiday_name_eng,
            name_marathi: holiday.holiday_name_mr
        }));
    },

    getRadius: async () => {
        const sql = `SELECT radius FROM tbl_loc_radius ORDER BY id DESC LIMIT 1`;
        const results = await query(sql);
        return results.length > 0 ? results[0].radius : null;
    },


    updateRadius: async (id, radius) => {
        try {
            // Check if id exists
            const checkSql = `SELECT id FROM tbl_loc_radius WHERE id = ?`;
            const checkResult = await query(checkSql, [id]);
            if (checkResult.length === 0) {
                return {
                    success: false,
                    message: "ID not found in tbl_loc_radius",
                    data: null
                };
            }

            // Update radius
            const updateSql = `UPDATE tbl_loc_radius SET radius = ? WHERE id = ?`;
            const updateResult = await query(updateSql, [radius, id]);

            if (updateResult.affectedRows === 0) {
                return {
                    success: false,
                    message: "Failed to update radius",
                    data: null
                };
            }

            return {
                success: true,
                message: "Radius updated successfully",
                data: { id, radius }
            };
        } catch (error) {
            console.error("Error in updateRadius:", error);
            throw new Error(`Failed to update radius: ${error.message}`);
        }
    },

    getRadiusWeb: async () => {
        try {
            const sql = `SELECT id, radius FROM tbl_loc_radius`;
            const result = await query(sql);
    
            return {
                success: true,
                message: result.length ? "Radius list retrieved successfully" : "No radius data found",
                data: result
            };
        } catch (error) {
            console.error("Error in getAllRadiusWeb:", error);
            throw new Error(`Failed to retrieve radius list: ${error.message}`);
        }
    }
};

