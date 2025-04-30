import { hodService } from "../services/hodService.js";

export const hodController = {
  getEmployeesByHodController: async (req, res) => {
    const { hod_id } = req.params;
    try {
      const result = await hodService.getEmployeesByHod(hod_id);

      if (result.message) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Database error", details: err.message });
    }
  },
  updateEmployeeStatus: async (req, res) => {
      const { employee_id, status } = req.body; 
      const { hod_id } = req.params;

    
      if (![1, 2].includes(status)) {
        return res.status(400).json({ error: "Invalid status value. Use 1 for accept, 2 for reject." });
      }
    
      try {
        const result = await hodService.updateEmployeeStatus(hod_id, employee_id, status);
    
        if (result.message) {
          if (result.message === "This user is not a valid HOD") {
            return res.status(400).json({ error: result.message }); 
          }
          return res.status(200).json({ message: result.message }); 
        }
    
        res.status(400).json({ error: "Failed to update employee status" }); 
      } catch (err) {
        console.error("Error updating employee status:", err);
        res.status(500).json({ error: "Database error", details: err.message });
      }
    },


    getUsersByHodDept: async (req, res) => {
      try {
          const { dept_id } = req.query;

          // Validate dept_id
          if (!dept_id || isNaN(dept_id)) {
              return res.status(400).json({
                  status: false,
                  message: 'Valid dept_id is required'
              });
          }

          const users = await hodService.getUsersByHodDept({ dept_id: parseInt(dept_id) });
          res.status(200).json({
              status: true,
              message: 'Users retrieved successfully',
              data: users
          });
      } catch (error) {
          res.status(500).json({
              status: false,
              message: error.message
          });
      }
  },


  updateFieldStatus: async (req, res) => {
    try {
        const { user_id, field_status } = req.body;

        // Validate required fields
        if (!user_id || field_status === undefined) {
            return res.status(400).json({
                status: false,
                message: 'user_id and field_status are required'
            });
        }

        // Validate field_status
        if (field_status !== 0 && field_status !== 1) {
            return res.status(400).json({
                status: false,
                message: 'field_status must be 0 (inactive) or 1 (active)'
            });
        }

        await hodService.updateFieldStatus({ user_id, field_status });
        res.status(200).json({
            status: true,
            message: `Field status updated to ${field_status === 1 ? 'active' : 'inactive'} successfully`
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
},

getReportsPermissionForHod :async (req, res) => {
  try {
    const { user_id, status } = req.body;

    if (![0, 1].includes(Number(status))) {
      return res.status(400).json({ message: "Invalid status. Must be 0 or 1." });
    }

    const success = await hodService.getReportsPermissionForHod(user_id, status);

    if (success) {
      res.status(200).json({ message: "Report permission updated successfully." });
    } else {
      res.status(404).json({ message: "User is not HOD" });
    }
  } catch (error) {
    console.error("Error updating report permission:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

};
