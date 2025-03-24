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


    getOfficeLocationsByDepartmentId: async (departmentId) => {
        try {
            const sql = `
                SELECT id,loc_name_marathi 
                FROM office_location 
                WHERE dept_id = ?
            `;
            
            const results = await query(sql, [departmentId]);

            const locations = results.map(row =>({ id: row.id, loc_name_marathi: row.loc_name_marathi }));

            return locations;
        } catch (error) {
            console.error("Error in masterDropdownService - getOfficeLocationsByDepartmentId:", error);
            throw error; 
        }
    },

    getCadresByOfficeLocationId: async (officeLocationId) => {
        try {
          const sql = `
            SELECT c.id, c.cadre_name 
            FROM cadres c
            JOIN office_cadres oc ON c.id = oc.cadre_id
            WHERE oc.office_location_id = ?
          `;
          
          const results = await query(sql, [officeLocationId]);
          return results;
        } catch (error) {
          console.error("Error in OfficeCadreService - getCadresByOfficeLocationId:", error);
          throw error;
        }
      },

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