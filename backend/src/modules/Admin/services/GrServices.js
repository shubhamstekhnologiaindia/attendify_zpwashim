import dotenv from "dotenv";
import moment from "moment-timezone";
import { query } from "../../../../utils/database.js";
dotenv.config();
import path from 'path';

export const GRService = {
    
    insertGR: async (dept_id, subject, description, file_upload) => {
        try {
            const sql = `CALL StoreGR(?, ?, ?, ?)`; 
            const values = [dept_id, subject, description, file_upload];
            const result = await query(sql, values);
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    },
    updateGR: async (gr_id, dept_id, subject, description, file_upload) => {
        try {
            const sql = `CALL UpdateGR(?, ?, ?, ?, ?)`; 
            const values = [gr_id, dept_id, subject, description, file_upload];
            const result = await query(sql, values);
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    },
    getGRByDepartment: async (dept_id) => {
        try {
            let sql = `SELECT * FROM tbl_gr`;
            let params = [];

            if (dept_id) {
                sql += ` WHERE dept_id = ?`;
                params.push(dept_id);
            }

            const result = await query(sql, params);

           
            return result.map(gr => ({
                ...gr,
                file_upload: gr.file_upload 
                    ? `uploads/upload_gr/${path.basename(gr.file_upload)}`
                    : null
            }));

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
