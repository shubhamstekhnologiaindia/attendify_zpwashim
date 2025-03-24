import { query } from "../../../../utils/database.js";

export const masterDropdownService = {
    getDepartments: async () => {
        try {
            const sql = "SELECT id, dept_name_marathi FROM departments";
            
            const results = await query(sql);

            const departments = results.map(row => ({
                id: row.id,
                dept_name_marathi: row.dept_name_marathi
            }));

            return departments;
        } catch (error) {
            console.error("Error in DepartmentService - getDepartments:", error);
            throw error; 
        }
    },
    getTalukas: async () => {
        try {
            const sql = "SELECT id, taluka_name FROM taluka";
            const results = await query(sql);

            return results.map(row => ({
                id: row.id,
                taluka_name: row.taluka_name
            }));
        } catch (error) {
            console.error("Error in TalukaService - getTalukas:", error);
            throw error;
        }
    },

    getVillagesByTalukaId: async (talukaId) => {
        try {
            const sql = "SELECT id, gav_name FROM villages WHERE taluka_id = ?";
            const results = await query(sql, [talukaId]);

            return results.map(row => ({
                id: row.id,
                village_name: row.gav_name  
            }));
        } catch (error) {
            console.error("Error in VillageService - getVillagesByTalukaId:", error);
            throw error;
        }
    }
};