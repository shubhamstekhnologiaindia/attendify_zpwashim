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

  checking_salary_slip_per: async (user_id) => {
    try {
      const checkpermissionQuery =
        "SELECT salary_slip_per_id AS salary_slip_permission_id,salary_slip_per_userid AS user_id,salary_slip_per_departnment_id AS departnment_id FROM tbl_salary_slip_per WHERE salary_slip_per_userid = ? AND permission_status = 1";
      const [fetchPermission] = await query(checkpermissionQuery, [user_id]);

      console.log(fetchPermission);

      return fetchPermission;
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
          ) VALUES (?, ?, ?, ?, 0)
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
        status: 0,
        created_at: new Date(),
      };
    } catch (error) {
      console.error("Error in storeSalarySlipRequest service:", error);
      throw new Error("Failed to store salary slip request");
    }
  },

  uploadToAzure: async (userId, file) => {
    // 1. Load and trim env vars
    const connStr = (process.env.AZURE_STORAGE_CONNECTION_STRING || "").trim();
    const container = (process.env.CONTAINER_NAME || "").trim();

    console.log(connStr);
    console.log(container);

    // 2. Validate
    if (!connStr) {
      throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING");
    }
    if (!container) {
      throw new Error("Missing CONTAINER_NAME");
    }

    // 3. Create clients
    const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
    const containerClient = blobServiceClient.getContainerClient(container);

    // 4. Build a unique blob name
    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // 5. Upload the buffer
    await blockBlobClient.upload(file.buffer, file.size);

    // 6. Return the publicly addressable URL
    return { blobUrl: blockBlobClient.url };
  },

  listSalarySlipPermissions: async () => {
    try {
      const sql = `
                SELECT 
                  p.salary_slip_per_id,
                  p.salary_slip_per_userid,
                  u.first_name,
                  u.last_name
                FROM tbl_salary_slip_per p
                LEFT JOIN users u ON p.salary_slip_per_userid = u.id
              `;
      const permissions = await query(sql);

      // Decrypt names and construct full_name
      return permissions.map((perm) => ({
        salary_slip_per_id: perm.salary_slip_per_id,
        salary_slip_per_userid: perm.salary_slip_per_userid,
        full_name:
          perm.first_name && perm.last_name
            ? `${decrypt(perm.first_name)} ${decrypt(perm.last_name)}`
            : null,
      }));
    } catch (error) {
      console.error("Error in listSalarySlipPermissions service:", error);
      throw new Error("Failed to retrieve salary slip permissions");
    }
  },
};
