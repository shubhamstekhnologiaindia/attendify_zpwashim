import { query } from "../../../../utils/database.js";

export const masterDataService = {
  getDepartments: async () => {
    try {
      const sql = "SELECT id, dept_name_marathi FROM departments";

      const results = await query(sql);

      const departments = results.map((row) => ({
        id: row.id,
        dept_name_marathi: row.dept_name_marathi,
      }));

      return departments;
    } catch (error) {
      console.error("Error in DepartmentService - getDepartments:", error);
      throw error;
    }
  },


  getOfficeLocationDropdown: async (departmentId) => {
    try {
      let defaultSql = `
      SELECT loc_id, loc_name_marathi, location_type 
      FROM office_location 
      WHERE dept_id IS NULL 
      ORDER BY loc_id ASC 
      LIMIT 8
    `;

      const defaultResults = await query(defaultSql);

      let filteredResults = [];

      if (departmentId && !isNaN(departmentId)) {
        const filterSql = `
        SELECT loc_id, loc_name_marathi, location_type 
        FROM office_location 
        WHERE dept_id = ? 
        ORDER BY loc_id ASC
      `;
        filteredResults = await query(filterSql, [departmentId]);
      }

      // Combine both results
      const combinedResults = [...defaultResults, ...filteredResults];

      const formattedData = combinedResults.map((row) => ({
        type: row.location_type || "unknown",
        id: row.loc_id,
        name: row.loc_name_marathi,
      }));

      return formattedData;
    } catch (error) {
      console.error(
        "Error in masterDataService - getOfficeLocationDropdown:",
        error
      );
      throw {
        success: false,
        message: "Error fetching office locations",
      };
    }
  },

 
  getCadresByOfficeLocationId: async (officeLocationId, dept_id) => {
    try {
      const sql = `
        SELECT DISTINCT c.id AS cader_id, c.cader_name
        FROM tbl_cader c
        JOIN office_cadres oc ON c.id = oc.cadre_id
        JOIN users u ON u.cader_id = c.id AND u.office_location_id = oc.office_location_id
        WHERE oc.office_location_id = ? AND u.department_id = ?
      `;
      const results = await query(sql, [officeLocationId, dept_id]);
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

      const departments = results.map((row) => ({
        id: row.id,
        dept_name_marathi: row.dept_name_marathi,
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

      return results.map((row) => ({
        id: row.id,
        taluka_name: row.taluka_name,
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

      return results.map((row) => ({
        id: row.id,
        village_name: row.gav_name,
      }));
    } catch (error) {
      console.error("Error in VillageService - getVillagesByTalukaId:", error);
      throw error;
    }
  },
  // service.js
  getCadresByDeptId: async (deptId) => {
    try {
      const result = await query(
        `SELECT 
          c.id AS cader_id,
          c.cader_name,
          c.cader_name
       FROM 
          department_cadre dc
       INNER JOIN 
          tbl_cader c ON dc.cader_id = c.id
       WHERE 
          dc.department_id = ?`,
        [deptId]
      );

      return {
        status: true,
        data: result,
        message: "Cadres fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching cadres:", error);
      throw {
        status: false,
        message: "Database error while fetching cadres",
      };
    }
  },
  GetPanchayatSamitiLocations: async () => {
    try {
      const locations = await query(
        `SELECT loc_id, loc_name_marathi, loc_name_eng, location_type 
         FROM office_location 
         WHERE location_type = ?`,
        ['panchayat_samiti']
      );
  
      console.log("Panchayat Samiti Locations:", locations);
  
      return {
        status: true,
        data: locations,
      };
    } catch (error) {
      console.error("Service Error:", error);
      throw {
        status: false,
        message: "Database error while fetching Panchayat Samiti location details",
      };
    }
  },
// services/masterDataService.js

GetSansthaLocations: async (deptId) => {
  try {
    const fetchSanstha = await query(
      `SELECT *
       FROM office_location 
       WHERE location_type = ? AND dept_id = ?`,
      ['sanstha',deptId]
    );

    console.log("Sanstha Locations:", fetchSanstha);

    return {
      status: true,
      data: fetchSanstha,
    };
  } catch (error) {
    console.error("Service Error:", error);
    throw {
      status: false,
      message: "Database error while fetching Sanstha locations",
    };
  }
}


  
};
