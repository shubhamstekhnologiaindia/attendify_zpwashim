import { query } from "../../../../utils/database.js";
import { decrypt, decryptDeterministic } from "../../../../utils/crypto.js"; // Import decryption function
import { sendStatusApprovedSMS } from "../../../../utils/smsSender.js";

export const hodService = {
  getEmployeesByHod: async (hod_id) => {
    try {
      const talukaQuery = "SELECT id FROM taluka WHERE hod_id = ?";
      const talukaResults = await query(talukaQuery, [hod_id]);

      if (
        !talukaResults ||
        talukaResults.length === 0 ||
        !talukaResults[0]?.id
      ) {
        return { message: "No Taluka assigned to this HOD" };
      }

      const talukaId = talukaResults[0].id;

      const employeeQuery = `
        SELECT u.id, u.first_name, u.last_name, u.mob_no, u.email, u.status, u.department_id, d.department_name
        FROM users u
        JOIN departments d ON u.department_id = d.id
        WHERE taluka_id = ? AND role_id = 103
      `;
      const employeeResults = await query(employeeQuery, [talukaId]);

      if (!employeeResults || employeeResults.length === 0) {
        return { message: "No Employees found with role_id 103" };
      }

      console.log("Employee Results: ", employeeResults); 
      const decryptedEmployees = employeeResults.map((employee) => ({
        id: employee.id,
        first_name: decrypt(employee.first_name) || "N/A",
        last_name: decrypt(employee.last_name) || "N/A",
        mob_no: decrypt(employee.mob_no) || "N/A",
        email: decrypt(employee.email) || "N/A",
        status: employee.status,
        department_id: employee.department_id,
        department_name: employee.department_name,
      }));

      return {
        hod_id,
        taluka_id: talukaId,
        employees: decryptedEmployees,
      };
    } catch (err) {
      return { error: "Database error", details: err.message };
    }
  },
  // updateEmployeeStatus: async (hod_id, employee_id, status) => {
  //   try {
     
  
  //     // Update employee status (1 = approved, 2 = rejected)
  //     const updateStatusQuery = `
  //       UPDATE users SET status = ${status} WHERE id = ${employee_id};
  //     `;
  //     console.log("Checking",updateStatusQuery); // Log the HOD ID for debugging

  //     const response = await query(updateStatusQuery);
  //     console.log("Response:", response); // Log the response for debugging
  
  //     return { message: status === 1 ? "Employee status approved successfully" : "Employee status rejected successfully" };
  //   } catch (err) {
  //     console.error("Database error: ", err.message);
  //     return { error: "Database error", details: err.message };
  //   }
  // },
  updateEmployeeStatus: async (hod_id, employee_id, status) => {

    try {
    // Step 1: Get encrypted mobile number
    const [user] = await query(`SELECT mob_no FROM users WHERE id = ?`, [employee_id]);

    if (!user) {
      return { message: "Employee not found" };
    }

    // Step 2: If status = 1, decrypt and send SMS
    if (status === 1) {
      const decryptedMobile = decryptDeterministic(user.mob_no);
      if (!decryptedMobile) {
        return { message: "Status updated, but failed to decrypt mobile" };
      }

      const smsSent = await sendStatusApprovedSMS(decryptedMobile);
      if (!smsSent) {
        return { message: "Status updated, but SMS sending failed" };
      }
    }

    // Step 3: Update status securely
    const updateQuery = `UPDATE users SET status = ? WHERE id = ?`;
    const result = await query(updateQuery, [status, employee_id]);

    return {
      message: status === 1
        ? "Employee status approved and SMS sent"
        : "Employee status rejected",
    };
  } catch (err) {
    console.error("Error in updateEmployeeStatus:", err.message);
    return { error: "Database error", details: err.message };
  }
},
getUsersByHodDept: async ({ dept_id, role_id }) => {
  try {
    let usersSql;
    let queryParams = [];

    if (role_id === 101) {
      // 🔹 Admin — always show all users, ignore dept_id
      usersSql = `
        SELECT 
            u.id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.mob_no,
            d.dept_name_marathi,
            c.cader_name,
            u.email,
            u.field_status
        FROM users u
        JOIN departments d ON u.department_id = d.id
        JOIN tbl_cader c ON u.cader_id = c.id
        WHERE u.department_id IS NOT NULL
        ORDER BY d.dept_name_marathi, u.first_name
      `;
    } else {
      // 🔹 Non-admin (e.g., HOD, officer, etc.)
      const hodCheckSql = `
        SELECT COUNT(*) AS hod_count
        FROM users
        WHERE role_id = 102 AND department_id = ? AND department_id IS NOT NULL
      `;
      const [hodCheck] = await query(hodCheckSql, [dept_id]);

      if (hodCheck.hod_count === 0) {
        throw new Error("No HOD found in the specified department");
      }

      usersSql = `
        SELECT 
            u.id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.mob_no,
            d.dept_name_marathi,
            c.cader_name,
            u.email,
            u.field_status
        FROM users u
        JOIN departments d ON u.department_id = d.id
        JOIN tbl_cader c ON u.cader_id = c.id
        WHERE u.department_id = ?
        ORDER BY u.first_name
      `;
      queryParams = [dept_id];
    }

    const users = await query(usersSql, queryParams);

    if (users.length === 0) {
      throw new Error("No users found");
    }

    // 🔐 Decrypt data
    const decryptedUsers = users.map(user => ({
      user_id: user.id,
      full_name: `${decrypt(user.first_name)} ${decrypt(user.middle_name)} ${decrypt(user.last_name)}`.trim(),
      mob_no: decryptDeterministic(user.mob_no),
      dept_name_marathi: user.dept_name_marathi,
      cader_name: user.cader_name,
      email: user.email ? decrypt(user.email) : null,
      field_status: user.field_status
    }));

    return decryptedUsers;
  } catch (error) {
    console.error("Error in getUsersByHodDept service:", error);
    throw new Error(`Failed to retrieve users: ${error.message}`);
  }
},


//   getUsersByHodDept: async ({ dept_id }) => {
//     try {
//         // Step 1: Check if the department has at least one user with role_id = 102
//         const hodCheckSql = `
//             SELECT COUNT(*) AS hod_count
//             FROM users
//             WHERE role_id = 102 AND department_id = ? AND department_id IS NOT NULL
//         `;
//         const [hodCheck] = await query(hodCheckSql, [dept_id]);

//         if (hodCheck.hod_count === 0) {
//             throw new Error('No HOD found in the specified department');
//         }

//         // Step 2: Fetch all users in the specified department with department_name and cader_name
//         const usersSql = `
//             SELECT 
//                 u.id,
//                 u.first_name,
//                 u.middle_name,
//                 u.last_name,
//                 u.mob_no,
//                 d.dept_name_marathi,
//                 c.cader_name,
//                 u.email,
//                 u.field_status
//             FROM users u
//             JOIN departments d ON u.department_id = d.id
//             JOIN tbl_cader c ON u.cader_id = c.id
//             WHERE u.department_id = ?
//             ORDER BY u.first_name
//         `;
//         const users = await query(usersSql, [dept_id]);

//         if (users.length === 0) {
//             throw new Error('No users found in the specified department');
//         }

//         // Step 3: Decrypt encrypted fields
//         const decryptedUsers = users.map(user => ({
//            user_id: user.id,
//             full_name: `${decrypt(user.first_name)} ${decrypt(user.middle_name)} ${decrypt(user.last_name)}`.trim(),
//             mob_no: decryptDeterministic(user.mob_no),
//             dept_name_marathi: user.dept_name_marathi,
//             cader_name: user.cader_name,
//             email: user.email ? decrypt(user.email) : null,
//             field_status: user.field_status
//         }));

//         return decryptedUsers;
//     } catch (error) {
//         console.error('Error in getUsersByHodDept service:', error);
//         throw new Error(`Failed to retrieve users: ${error.message}`);
//     }
// },


  updateFieldStatus: async ({ user_id, field_status }) => {
    try {
        // Check if user exists
        const checkUserSql = `SELECT id FROM users WHERE id = ? LIMIT 1`;
        const existingUser = await query(checkUserSql, [user_id]);

        if (existingUser.length === 0) {
            throw new Error('User does not exist');
        }

        // Update field_status
        const updateSql = `
            UPDATE users 
            SET field_status = ?, updated_at = NOW()
            WHERE id = ?
        `;
        const result = await query(updateSql, [field_status, user_id]);

        if (result.affectedRows === 0) {
            throw new Error('Failed to update field status');
        }

        return { success: true };
    } catch (error) {
        console.error('Error in updateFieldStatus service:', error);
        throw new Error(`Failed to update field status: ${error.message}`);
    }
  },

  getReportsPermissionForHod :async (user_id, status) => {
    const sql = `
      UPDATE users 
      SET reports_permission_status = ? 
      WHERE id = ? AND role_id = 102
    `;
  
    const result = await query(sql, [status, user_id]);
    return result.affectedRows > 0;
  }
};
