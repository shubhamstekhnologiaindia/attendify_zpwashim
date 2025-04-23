import { query } from "../../../../utils/database.js";

export const SansthaService = {

    addSanstha: async ({ loc_name_marathi, loc_name_eng, dept_id }) => {
        try {
          console.log("Creating Sanstha:", {
            loc_name_marathi,
            loc_name_eng,
            dept_id
          });
      
          const sql = `
            INSERT INTO office_location (loc_name_marathi, loc_name_eng, dept_id, location_type)VALUES (?, ?, ?, 'sanstha')`;
      
          const result = await query(sql, [loc_name_marathi, loc_name_eng, dept_id]);
          return result.insertId;
      
        } catch (error) {
          console.error("Error creating Sanstha:", error);
          console.log(error)
          throw error;
        }
      },

      updateSanstha: async ({ loc_id, loc_name_marathi, loc_name_eng, dept_id }) => {
        try {
          const sql = `
            UPDATE office_location
            SET loc_name_marathi = ?, loc_name_eng = ?, dept_id = ?
            WHERE loc_id = ?
          `;
          const result = await query(sql, [loc_name_marathi, loc_name_eng, dept_id, loc_id]);
          return result;
        } catch (error) {
          console.error("Error updating Sanstha:", error);
          throw error;
        }
      },

      deleteSanstha: async (loc_id) => {
        try {
          const sql = `
            DELETE FROM office_location
            WHERE loc_id = ? AND location_type = 'sanstha'
          `;
          const result = await query(sql, [loc_id]);
          return result;
        } catch (error) {
          console.error("Error deleting Sanstha:", error);
          throw error;
        }
      },
      
}
