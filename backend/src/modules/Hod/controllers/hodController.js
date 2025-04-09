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
};
