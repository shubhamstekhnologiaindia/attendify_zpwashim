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
};
