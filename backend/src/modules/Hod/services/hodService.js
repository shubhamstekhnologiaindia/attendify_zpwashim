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
        SELECT u.id, u.first_name, u.last_name, u.mob_no, u.email, u.status, u.department_id, d.department_name
        FROM users u
        JOIN departments d ON u.department_id = d.id
        WHERE taluka_id = ? AND role_id = 103
      `;
      const employeeResults = await query(employeeQuery, [talukaId]);

      if (!employeeResults || employeeResults.length === 0) {
        return { message: "No Employees found with role_id 103" };
      }

      console.log("Employee Results: ", employeeResults); // Debugging line

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
  updateEmployeeStatus: async (hod_id, employee_id, status) => {
    try {
      // Check if the HOD ID is valid by querying the taluka table
      const checkHodQuery = `SELECT id FROM taluka WHERE hod_id = ?`;
      const checkHod = await query(checkHodQuery, [hod_id]);
  
      if (!checkHod || checkHod.length === 0) {
        return { message: "This user is not a valid HOD" };
      }
  
      // Check if employee belongs to the specified HOD (via taluka_id)
      const checkEmployeeQuery = `
        SELECT id FROM users WHERE id = ? AND taluka_id IN (SELECT id FROM taluka WHERE hod_id = ?)
      `;
      const checkEmployee = await query(checkEmployeeQuery, [employee_id, hod_id]);
  
      if (!checkEmployee || checkEmployee.length === 0) {
        return { message: "Employee not found or doesn't belong to the HOD" };
      }
  
      // Update employee status (1 = approved, 2 = rejected)
      const updateStatusQuery = `
        UPDATE users SET status = ? WHERE id = ?
      `;
      await query(updateStatusQuery, [status, employee_id]);
  
      return { message: status === 1 ? "Employee status approved successfully" : "Employee status rejected successfully" };
    } catch (err) {
      console.error("Database error: ", err.message);
      return { error: "Database error", details: err.message };
    }
  },
};
