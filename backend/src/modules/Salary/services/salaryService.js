import { query } from "../../../../utils/database.js";
import multer from "multer";
import dotenv from 'dotenv';
import { decrypt, decryptDeterministic,encrypt,encryptDeterministic } from "../../../../utils/crypto.js"; 

dotenv.config();



import { BlobServiceClient } from "@azure/storage-blob";



export const SalaryService = {
        saveSalarySlipPermission : async (user_id, dept_ids) => {
            try {
              // Prepare the values for multiple departments
              const values = dept_ids.map(dept_id => [user_id, dept_id]);
          
              // Use a transaction for multiple inserts (optional for better atomicity)
              const result = await query(
                `INSERT INTO tbl_salary_slip_per 
                 (salary_slip_per_userid, salary_slip_per_departnment_id) 
                 VALUES ?`,
                [values]
              );
          
              // Log the result to inspect the query response
              console.log("Query result:", result);
          
              // Check if the result contains affected rows
              if (result && result.affectedRows > 0) {
                return {
                  status: true,
                  message: `${result.affectedRows} Permissions saved successfully.`,
                };
              } else {
                throw new Error("Insert failed: No records were inserted.");
              }
            } catch (error) {
              console.error("Service Error (saveSalarySlipPermission):", error);
              throw {
                status: false,
                message: error.message || "Database error while saving salary slip permission.",
              };
            }
        },

        updateSalarySlipPermission : async (salary_slip_per_id, user_id, dept_id) => {
            try {
              const updatedAt = new Date(); // Current timestamp
          
              const result = await query(
                `UPDATE tbl_salary_slip_per 
                 SET salary_slip_per_userid = ?, 
                     salary_slip_per_departnment_id = ?, 
                     updated_at = ?
                 WHERE salary_slip_per_id = ?`,
                [user_id, dept_id, updatedAt, salary_slip_per_id]
              );
          
              console.log("Update Query Result:", result);
          
              if (result && result.affectedRows > 0) {
                return {
                  status: true,
                  message: `Permission updated successfully.`,
                };
              } else {
                throw new Error("Update failed: No record found for the given ID.");
              }
            } catch (error) {
              console.error("Service Error (updateSalarySlipPermission):", error);
              throw {
                status: false,
                message: error.message || "Database error while updating salary slip permission.",
              };
            }
        },
        
        deleteSalarySlipPermission : async (salary_slip_per_id) => {
            try {
              const updatedAt = new Date();
          
              const result = await query(
                `UPDATE tbl_salary_slip_per
                 SET permission_status = 0,
                     updated_at = ?
                 WHERE salary_slip_per_id = ?`,
                [updatedAt, salary_slip_per_id]
              );
          
              if (result && result.affectedRows > 0) {
                return {
                  status: true,
                  message: `Permission For User Deleted successfully.`,
                };
              } else {
                throw new Error("No record found for the given Salary Slip Permission ID.");
              }
            } catch (error) {
              throw {
                status: false,
                message: error.message || "Database error while soft-deleting salary slip permission.",
              };
            }
          },

          checking_salary_slip_per:async(user_id)=>{
            try {
              const checkpermissionQuery = 'SELECT salary_slip_per_id AS salary_slip_permission_id,salary_slip_per_userid AS user_id,salary_slip_per_departnment_id AS departnment_id FROM tbl_salary_slip_per WHERE salary_slip_per_userid = ? AND permission_status = 1';
              const [fetchPermission]= await query(checkpermissionQuery,[user_id])
        
         console.log(fetchPermission) 

         return fetchPermission;
        
        } catch (error) {
          console.error("Service Error (updateSalarySlipPermission):", error);
          throw {
            status: false,
            message: error.message || "Database error while updating salary slip permission.",
          };
        }
    },

    storeSalarySlipRequest: async ({ req_sender_id, req_reciver_id, salary_slip, month, description }) => {
      try {
        const sql = `
          INSERT INTO tbl_salary_slips (
            req_sender_id, req_reciver_id, salary_slip, month, description, status
          ) VALUES (?, ?, ?, ?, ?, 0)
        `;
        const result = await query(sql, [
          req_sender_id,
          req_reciver_id,
          salary_slip,
          month,
          description || null,
        ]);
  
        return {
          id: result.insertId,
          req_sender_id,
          req_reciver_id,
          salary_slip,
          month,
          description,
          status: 0,
          created_at: new Date(),
        };
      } catch (error) {
        console.error("Error in storeSalarySlipRequest service:", error);
        throw new Error("Failed to store salary slip request");
      }
    },


    FetchUsersForSalarySlip : async (userId) => {
      const fetchQuery = 'CALL FetchUsersForSalarySlip(?)';
      try {
        const [rows] = await query(fetchQuery, [userId]);
        return rows.map((r) => ({
          application_id : r.id,
          first_name:       decrypt(r.first_name),
          middle_name:      r.middle_name ? decrypt(r.middle_name) : null,
          last_name:        decrypt(r.last_name),
          cader_name:       r.cader_name,         // assuming not encrypted
          department_name:  r.department_name,    // assuming not encrypted
          description:      r.description,        // assuming not encrypted
          month:            r.month,              // format MM/YYYY
        }));

      } catch (error) {
        console.error('Error executing stored procedure:', error);
        throw new Error('Database error while fetching salary slips');
      }
    },


    uploadSalarySlipToAzure: async (application_id, file) => {
      try {
        // 1. Load and trim env vars
        const connStr   = (process.env.AZURE_STORAGE_CONNECTION_STRING || "").trim();
        const container = (process.env.CONTAINER_NAME || "").trim();
    
        if (!connStr) {
          throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING");
        }
        if (!container) {
          throw new Error("Missing CONTAINER_NAME");
        }
    
        // 2. Create clients
        const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
        const containerClient   = blobServiceClient.getContainerClient(container);
    
        // 3. Build a unique blob name
        const blobName        = `${Date.now()}-${file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
        // 4. Upload the buffer
        await blockBlobClient.upload(file.buffer, file.size);
    
        // 5. Insert/Update in DB
        const insertSalaryslipQuery = `UPDATE tbl_salary_slips SET salary_slip = ?, status = 2 WHERE id = ?`;

        const result=  await query(insertSalaryslipQuery, [blockBlobClient.url, application_id]);
  
        // 3. Check if any rows were affected
        if (result.affectedRows === 0) {
          // Specific error for "not found"
          const err = new Error(`No salary slip record found for applicationId=${application_id}`);
          err.code = 'NOT_FOUND';
          throw err;
        }
        return { blobUrl: blockBlobClient.url };
      } catch (error) {
        console.error("Error in uploadToAzure:", error.message || error);
        throw new Error("Upload failed: " + (error.message || "Unknown error"));
      }
    }

}