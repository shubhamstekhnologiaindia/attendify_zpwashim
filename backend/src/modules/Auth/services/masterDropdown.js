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
    }
};