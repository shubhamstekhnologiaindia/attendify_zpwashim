import dotenv from "dotenv";
import moment from "moment-timezone";
import { query } from "../../../../utils/database.js";
dotenv.config();
import path from 'path';
 
import { BlobServiceClient } from "@azure/storage-blob";
 
export const GRService = {
 
 uploadGrToAzure: async (dept_id, subject, description, file_upload) => {
    try {
      const connStr = (
        process.env.AZURE_GR_STORAGE_CONNECTION_STRING || ""
      ).trim();
      const container = (process.env.GR_CONTAINER_NAME || "").trim();
 
      if (!connStr) {
        throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING");
      }
      if (!container) {
        throw new Error("Missing CONTAINER_NAME");
      }
 
      // 2. Create clients
      const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
      const containerClient = blobServiceClient.getContainerClient(container);
 
      // 3. Build a unique blob name
      const blobName = `${Date.now()}-${file_upload.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
 
      // 4. Upload the buffer
      await blockBlobClient.upload(file_upload.buffer, file_upload.size);
 
      const azureUrl=blockBlobClient.url
 
      // 5. Insert/Update in DB
      const insertSalaryslipQuery = `INSERT INTO tbl_gr (dept_id,subject,description,file_upload) VALUES(?,?,?,?)`;
 
      const result = await query(insertSalaryslipQuery, [ dept_id, subject, description,azureUrl ]);
 
      return { azureUrl};
    } catch (error) {
      console.error("Error in uploadToAzure:", error.message || error);
      throw new Error("Upload failed: " + (error.message || "Unknown error"));
    }
  },
 
 getGRByDepartment: async (dept_id) => {
        try {
            let sql = `SELECT * FROM tbl_gr`;
            let params = [];
 
            if (dept_id) {
                sql += ` WHERE dept_id = ? AND gr_status=1`;
                params.push(dept_id);
            }
 
            const result = await query(sql, params);
           
            // Return direct Azure URL without path manipulation
            return result.map(gr => ({
                ...gr,
                file_upload: gr.file_upload || null // Already contains Azure URL
            }));
 
        } catch (error) {
            throw new Error(error.message);
        }
    },
 
    updateGR: async (gr_id, dept_id, subject, description, file_upload) => {
        try {
            // 1. Retrieve the existing file URL from the database
            const [existingGR] = await query('SELECT file_upload FROM tbl_gr WHERE gr_status=1 AND id = ?', [gr_id]);
     
            // 2. Initialize Azure Blob Storage clients once
            const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING.trim();
            const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
            const containerClient = blobServiceClient.getContainerClient(process.env.GR_CONTAINER_NAME.trim());
     
            let newFileUrl;
            if (file_upload) {
                // 3. If a new file is provided, delete the existing file (if it exists) and upload the new one
                if (existingGR?.file_upload) {
                    const blobName = existingGR.file_upload.split('/').pop();
                    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                    await blockBlobClient.deleteIfExists();
                }
                // Upload the new file with a unique blob name
                const blobName = `${Date.now()}-${file_upload.originalname}`;
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                await blockBlobClient.upload(file_upload.buffer, file_upload.size);
                newFileUrl = blockBlobClient.url;
            } else {
                // 4. If no new file is provided, keep the existing file URL (or null if none exists)
                newFileUrl = existingGR?.file_upload || null;
            }
     
            // 5. Update the database with the appropriate file URL
            const sql = `UPDATE tbl_gr SET
                dept_id = ?,
                subject = ?,
                description = ?,
                file_upload = ?
                WHERE id = ?`;
            const values = [dept_id, subject, description, newFileUrl, gr_id];
            return await query(sql, values);
        } catch (error) {
            throw new Error(error.message);
        }
    },
    deleteGRService: async (gr_id) => {
        try {
            // 1. Get file URL before deletion
            const [grRecord] = await query('SELECT file_upload FROM tbl_gr WHERE id = ?', [gr_id]);
 
            // 2. Delete from Azure
            if (grRecord?.file_upload) {
                const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING.trim();
                const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
                const containerClient = blobServiceClient.getContainerClient(
                    process.env.GR_CONTAINER_NAME.trim()
                );
 
                const blobName = grRecord.file_upload.split('/').pop();
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                await blockBlobClient.deleteIfExists();
            }
 
            // 3. Delete database record
            const sql = `UPDATE tbl_gr SET gr_status=0 WHERE id=?`;
            return await query(sql, [gr_id]);
 
        } catch (error) {
            throw new Error(error.message);
        }
    }  
};