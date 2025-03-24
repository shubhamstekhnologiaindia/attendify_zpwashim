import { query } from "../../../../utils/database.js";

export const MasterDropdown = {
    // Get all departments
    getDepartments: async (req, res) => {
        try {
            // SQL query to select all values from the `dept_name_marathi` column
            const sql = "SELECT dept_name_marathi FROM departments";
            
            // Execute the query
            const results = await query(sql);

            // Extract the `dept_name_marathi` values from the results
            const marathiDepartmentNames = results.map(row => row.dept_name_marathi);

            // Send the response with the list of department names in Marathi
            res.status(200).json({
                success: true,
                data: marathiDepartmentNames
            });
        } catch (error) {
            console.error("Error fetching departments:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },

    getTalukas: async (req, res) => {
        try {
            // SQL query to select all taluka names
            const sql = "SELECT taluka_name FROM taluka";
    
            // Execute the query
            const results = await query(sql);
    
            // Extract taluka names from the results
            const talukaNames = results.map(row => row.taluka_name);
    
            // Send the response with the list of taluka names
            res.status(200).json({
                success: true,
                data: talukaNames
            });
        } catch (error) {
            console.error("Error fetching talukas:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
    
};