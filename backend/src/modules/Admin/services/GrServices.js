import dotenv from "dotenv";
import moment from "moment-timezone";
import { query } from "../../../../utils/database.js";
dotenv.config();
import path from 'path';

export const GRService = {
    
    insertGR: async (dept_id, subject, description, file_upload) => {
        try {
            const sql = `CALL StoreGR(?, ?, ?, ?)`; // Call stored procedure
            const values = [dept_id, subject, description, file_upload];
            const result = await query(sql, values);
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    },
    updateGR: async (gr_id, dept_id, subject, description, file_upload) => {
        try {
            const sql = `CALL UpdateGR(?, ?, ?, ?, ?)`; // Call stored procedure
            const values = [gr_id, dept_id, subject, description, file_upload];
            const result = await query(sql, values);
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    },
    getGRByDepartment: async (dept_id) => {
        try {
            const sql = `SELECT * FROM tbl_gr WHERE dept_id = ?`;
            const result = await query(sql, [dept_id]);
    
            // Trim image path to get only filename (remove 'gr_uploads/')
            const formattedResult = result.map(gr => ({
                ...gr,
                file_upload: gr.file_upload 
                    ? path.basename(gr.file_upload.replace(/\\/g, '/').replace(/^gr_uploads\//, '').trim()) 
                    : null
            }));
    
            return formattedResult;
        } catch (error) {
            throw new Error(error.message);
        }
    },
     deleteGRService: async (gr_id) => {
        try {
            const sql = `DELETE FROM tbl_gr WHERE id = ?`;
            const values = [gr_id];
            const result = await query(sql, values); // Remove destructuring
    
            console.log("Delete Query Result:", result); // Debugging
    
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    }
   
};
