import { query } from "../../../../utils/database.js";
import { decrypt } from "../../../../utils/crypto.js"; // Import decryption function

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
        SELECT id, first_name, last_name, mob_no, email 
        FROM users 
        WHERE taluka_id = ? AND role_id = 103
      `;
      const employeeResults = await query(employeeQuery, [talukaId]);

      if (!employeeResults || employeeResults.length === 0) {
        return { message: "No Employees found with role_id 103" };
      }

      const decryptedEmployees = employeeResults.map((employee) => ({
        id: employee.id,
        first_name: decrypt(employee.first_name) || "N/A",
        last_name: decrypt(employee.last_name) || "N/A",
        mob_no: decrypt(employee.mob_no) || "N/A",
        email: decrypt(employee.email) || "N/A",
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
};
