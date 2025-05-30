import { query } from "../../../../utils/database.js";
import {
  encrypt,
  decrypt,
  encryptDeterministic,
  decryptDeterministic,
} from "../../../../utils/crypto.js";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

import { BlobServiceClient } from "@azure/storage-blob";

// const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
// const CONTAINER_NAME = process.env.CONTAINER_NAME;

export const SalaryService = {
  saveSalarySlipPermission: async (user_id, dept_ids) => {
    try {
      // Prepare the values for multiple departments
      const values = dept_ids.map((dept_id) => [user_id, dept_id]);

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
        message:
          error.message ||
          "Database error while saving salary slip permission.",
      };
    }
  },

  updateSalarySlipPermission: async (salary_slip_per_id, user_id, dept_id) => {
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
        message:
          error.message ||
          "Database error while updating salary slip permission.",
      };
    }
  },

  deleteSalarySlipPermission: async (salary_slip_per_id) => {
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
        throw new Error(
          "No record found for the given Salary Slip Permission ID."
        );
      }
    } catch (error) {
      throw {
        status: false,
        message:
          error.message ||
          "Database error while soft-deleting salary slip permission.",
      };
    }
  },

          checking_salary_slip_per:async (userId) => {
            const sql = 'CALL CheckSalarySlipAndReportPerms(?)';
            try {
              const [rows] = await query(sql, [userId]);
              const result = rows[0];             // first (and only) row from the SP
              return result || null;             // null if no matching row
            } catch (error) {
              console.error('Service Error (checkSalaryAndReportPerms):', error);
              throw new Error('Database error while checking permissions');
            }
          },
    

  storeSalarySlipRequest: async ({
    req_sender_id,
    req_reciver_id,

    month,
    description,
  }) => {
    try {
      // Insert salary slip request
      const sql = `
          INSERT INTO tbl_salary_slips (
            req_sender_id, req_reciver_id, month, description, status
          ) VALUES (?, ?, ?, ?, 1)
        `;
      const result = await query(sql, [
        req_sender_id,
        req_reciver_id,
        month,
        description || null,
      ]);

      // Fetch receiver's FCM token
      const fcmSql = `
                SELECT fcm_token
                FROM users
                WHERE id = ? AND status = 1 AND fcm_token IS NOT NULL
                LIMIT 1
              `;
      const [user] = await query(fcmSql, [req_reciver_id]);

      // Send push notification if FCM token exists
      if (user && user.fcm_token) {
        const message = {
          notification: {
            title: "New Salary Slip Request",
            body: `You have received a new salary slip request for ${month}.`,
          },
          token: user.fcm_token,
        };

        try {
          await admin.messaging().send(message);
          console.log(`Notification sent to user ${req_reciver_id}`);
        } catch (fcmError) {
          console.error(
            `Failed to send notification to user ${req_reciver_id}:`,
            fcmError
          );
        }
      } else {
        console.log(`No valid FCM token for user ${req_reciver_id}`);
      }

      return {
        id: result.insertId,
        req_sender_id,
        req_reciver_id,
        month,
        description,
        status: 1,
        created_at: new Date(),
      };
    } catch (error) {
      console.error("Error in storeSalarySlipRequest service:", error);
      throw new Error("Failed to store salary slip request");
    }
  },

  FetchUsersForSalarySlip: async (userId) => {
    const fetchQuery = "CALL FetchUsersForSalarySlip(?)";
    try {
      const [rows] = await query(fetchQuery, [userId]);
      return rows.map((r) => ({
        application_id: r.id,
        first_name: decrypt(r.first_name),
        middle_name: r.middle_name ? decrypt(r.middle_name) : null,
        last_name: decrypt(r.last_name),
        cader_name: r.cader_name, // assuming not encrypted
        department_name: r.department_name, // assuming not encrypted
        description: r.description, // assuming not encrypted
        month: r.month, // format MM/YYYY
      }));
    } catch (error) {
      console.error("Error executing stored procedure:", error);
      throw new Error("Database error while fetching salary slips");
    }
  },

  uploadSalarySlipToAzure: async (application_id, file) => {
    try {
      // 1. Load and trim env vars
      const connStr = (
        process.env.AZURE_STORAGE_CONNECTION_STRING || ""
      ).trim();
      const container = (process.env.CONTAINER_NAME || "").trim();

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
      const blobName = `${Date.now()}-${file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // 4. Upload the buffer
      await blockBlobClient.upload(file.buffer, file.size);

      // 5. Insert/Update in DB
      const insertSalaryslipQuery = `UPDATE tbl_salary_slips SET salary_slip = ?, status = 2 WHERE id = ?`;

      const result = await query(insertSalaryslipQuery, [
        blockBlobClient.url,
        application_id,
      ]);

      // 3. Check if any rows were affected
      if (result.affectedRows === 0) {
        // Specific error for "not found"
        const err = new Error(
          `No salary slip record found for applicationId=${application_id}`
        );
        err.code = "NOT_FOUND";
        throw err;
      }
      return { blobUrl: blockBlobClient.url };
    } catch (error) {
      console.error("Error in uploadToAzure:", error.message || error);
      throw new Error("Upload failed: " + (error.message || "Unknown error"));
    }
  },
  getListOfSalaryHeads: async () => {
    const sql = `
              SELECT 
                ssp.salary_slip_per_id,
                ssp.salary_slip_per_userid,
                ssp.salary_slip_per_departnment_id,
                ssp.created_at,
                ssp.created_by,
                u.id,
                u.mob_no,
                u.first_name,
                u.middle_name,
                u.last_name,
                d.dept_name_marathi
              FROM 
                tbl_salary_slip_per ssp
              JOIN 
                users u ON ssp.salary_slip_per_userid = u.id
              JOIN 
                departments d ON CAST(ssp.salary_slip_per_departnment_id AS UNSIGNED) = d.id
              WHERE 
                ssp.permission_status = 1
            `;

    const rows = await query(sql);

    const decryptedRows = rows.map((row) => ({
      user_id: row.id,
      salary_slip_per_id: row.salary_slip_per_id,
      salary_slip_per_userid: row.salary_slip_per_userid,
      salary_slip_per_departnment_id: row.salary_slip_per_departnment_id,
      created_at: row.created_at,
      created_by: row.created_by,
      mob_no: decryptDeterministic(row.mob_no),
      first_name: decrypt(row.first_name),
      middle_name: decrypt(row.middle_name),
      last_name: decrypt(row.last_name),
      department_name: row.dept_name_marathi,
    }));

    return decryptedRows;
  },


  listSalarySlipPermissions: async () => {
    try {
      const sql = `
        SELECT 
          MAX(p.salary_slip_per_id) AS salary_slip_per_id,
          p.salary_slip_per_userid,
          u.first_name,
          u.last_name
        FROM tbl_salary_slip_per p
        LEFT JOIN users u ON p.salary_slip_per_userid = u.id
        GROUP BY p.salary_slip_per_userid, u.first_name, u.last_name
      `;
      const permissions = await query(sql);

      // Decrypt names and construct full_name
      return permissions.map((perm) => ({
        salary_slip_per_id: perm.salary_slip_per_id,
        salary_slip_per_userid: perm.salary_slip_per_userid,
        full_name: perm.first_name && perm.last_name 
          ? `${decrypt(perm.first_name)} ${decrypt(perm.last_name)}`
          : null,
      }));
    } catch (error) {
      console.error("Error in listSalarySlipPermissions service:", error);
      throw new Error("Failed to retrieve salary slip permissions");
    }
  },
  // list request of salry slip in mobile
  listSalarySlipsBySender: async (req_sender_id) => {
    try {
      // Validate req_sender_id exists in users
      const userCheckSql = `SELECT id FROM users WHERE id = ? LIMIT 1`;
      const user = await query(userCheckSql, [req_sender_id]);
      if (user.length === 0) {
        throw new Error("Invalid req_sender_id: User not found");
      }

      // Fetch salary slips with sender and receiver names
      const sql = `
      SELECT 
        s.req_sender_id,
        s.req_reciver_id,
        s.month,
        s.status,
        s.salary_slip,
        us.first_name AS sender_first_name,
        us.last_name AS sender_last_name,
        ur.first_name AS receiver_first_name,
        ur.last_name AS receiver_last_name
      FROM tbl_salary_slips s
      LEFT JOIN users us ON s.req_sender_id = us.id
      LEFT JOIN users ur ON s.req_reciver_id = ur.id
      WHERE s.req_sender_id = ?
    `;
      const slips = await query(sql, [req_sender_id]);

      // Handle empty results
      if (!slips || slips.length === 0) {
        return [];
      }

      // Map results to include decrypted names, status text, and salary_slip
      return slips.map((slip) => {
        if (!slip || slip.status === undefined) {
          console.error("Invalid slip data:", slip);
          throw new Error("Invalid data returned from query");
        }

        let statusText;
        switch (slip.status) {
          case 1:
            statusText = "Pending";
            break;
          case 2:
            statusText = "Approved";
            break;
          case 3:
            statusText = "Rejected";
            break;
          default:
            console.warn(`Unexpected status value: ${slip.status}`);
            statusText = null;
        }
        return {
          sender_name:
            slip.sender_first_name && slip.sender_last_name
              ? `${decrypt(slip.sender_first_name)} ${decrypt(
                  slip.sender_last_name
                )}`
              : null,
          receiver_name:
            slip.receiver_first_name && slip.receiver_last_name
              ? `${decrypt(slip.receiver_first_name)} ${decrypt(
                  slip.receiver_last_name
                )}`
              : null,
          month: slip.month,
          status: statusText,
          salary_slip: slip.salary_slip,
        };
      });
    } catch (error) {
      console.error("Error in listSalarySlipsBySender service:", error);
      throw error;
    }
  },

   rejectSalarySlipRequest: async (id) => {
  try {
    const result = await query(
      'UPDATE tbl_salary_slips SET status = 3 WHERE id = ?',
      [id]
    );
    return result;  // result is directly the response from DB
  } catch (error) {
    throw error;
  }
  },
};
