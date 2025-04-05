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

    getMasterDropdownData: async (departmentId) => {
      try {
        // 1. Panchayat Samitis
        const panchayatSql = `SELECT id, name FROM panchayat_samiti WHERE status = 'Active' ORDER BY id ASC`;
        const panchayatResults = await query(panchayatSql);
    
        const panchayatSamitis = panchayatResults.map(row => ({
          id: row.id,
          name: row.name,
        }));
    
        // 2. Headquarters
        const headquarterSql = `SELECT head_id, name FROM tbl_headquarter ORDER BY head_id ASC`;
        const headquarterResults = await query(headquarterSql);
    
        const headquarters = headquarterResults.map(row => ({
          head_id: row.head_id,
          name: row.name,
        }));
    
        // 3. Sansthas filtered by department
        const sansthaSql = `SELECT id, sanstha_name FROM sanstha WHERE dept_id = ? ORDER BY id ASC`;
        const sansthaResults = await query(sansthaSql, [departmentId]);
    
        const sansthas = sansthaResults.map(row => ({
          id: row.id,
          sanstha_name: row.sanstha_name,
        }));
    
        // Return combined data
        return {
          panchayatSamitis,
          headquarters,
          sansthas,
        };
      } catch (error) {
        console.error("Error in masterDropdownService - getMasterDropdownData:", error);
        throw error;
      }
    },
    
   
    // getHeadquarters: async () => {
    //     try {
    //       const sql = `SELECT head_id, name FROM tbl_headquarter ORDER BY head_id ASC`;
    //       const results = await query(sql);
    
    //       return results.map(row => ({
    //         head_id: row.head_id,
    //         name: row.name,
    //       }));
    //     } catch (error) {
    //       console.error("Error in masterDropdownService - getHeadquarters:", error);
    //       throw error;
    //     }
    //   },

    //   getAllSansthas: async () => {
    //     try {
    //       const sql = `
    //         SELECT id, sanstha_name, taluka_id, sansta_location 
    //         FROM sanstha 
    //         ORDER BY id ASC
    //       `;
    //       const results = await query(sql);
    //       return results.map(row => ({
    //         id: row.id,
    //         sanstha_name: row.sanstha_name,
    //         taluka_id: row.taluka_id,
    //         sansta_location: row.sansta_location,
    //       }));
    //     } catch (error) {
    //       console.error("Error in masterDropdownService - getAllSansthas:", error);
    //       throw error;
    //     }
    //   },
    
    //   // Fetch office locations by department ID
    //   getOfficeLocationsByDepartmentId: async (departmentId) => {
    //     try {
    //       const sql = `
    //           SELECT id, loc_name_marathi 
    //           FROM office_location 
    //           WHERE dept_id = ?
    //       `;
    
    //       const results = await query(sql, [departmentId]);
    
    //       return results.map(row => ({
    //         id: row.id,
    //         loc_name_marathi: row.loc_name_marathi,
    //       }));
    //     } catch (error) {
    //       console.error("Error in masterDropdownService - getOfficeLocationsByDepartmentId:", error);
    //       throw error;
    //     }
    //   },

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