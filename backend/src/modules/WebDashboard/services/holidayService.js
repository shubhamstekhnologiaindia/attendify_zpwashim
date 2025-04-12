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
    }
};

