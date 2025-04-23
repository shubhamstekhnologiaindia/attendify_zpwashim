import { SansthaService } from "../services/sansthaService.js";


export const SansthaController = {

    addSanstha: async (req, res) => {
        try {
          const { loc_name_marathi, loc_name_eng, dept_id } = req.body;
      
          const sansthaId = await SansthaService.addSanstha({
            loc_name_marathi,
            loc_name_eng: loc_name_eng ? loc_name_eng : '' ,
            dept_id
          });
      
          res.status(201).json({
            message: "Sanstha created successfully",
            sansthaId
          });
      
        } catch (error) {
          console.error("Controller Error - create Sanstha:", error);
          res.status(500).json({
            message: "Failed to create Sanstha",
            error: error.message
          });
        }
      },

      updateSanstha: async (req, res) => {
        try {
          const { loc_id, loc_name_marathi, loc_name_eng, dept_id } = req.body;
    
          if (!loc_id) {
            return res.status(400).json({ message: "loc_id is required for update" });
          }
    
          await SansthaService.updateSanstha({
            loc_id,
            loc_name_marathi,
            loc_name_eng: loc_name_eng ? loc_name_eng : '' ,
            dept_id
          });
    
          res.status(200).json({ message: "Sanstha Updated Successfully" });
    
        } catch (error) {
          console.error("Error in SansthaController.update:", error);
          res.status(500).json({
            message: "Failed to Update Sanstha",
            error: error.message
          });
        }
      },
    
      deleteSanstha: async (req, res) => {
        try {
          const { loc_id } = req.query;
      
          if (!loc_id) {
            return res.status(400).json({ message: "loc_id is required" });
          }
      
          await SansthaService.deleteSanstha(loc_id);
      
          res.status(200).json({ message: "Sanstha Deleted Successfully" });
        } catch (error) {
          console.error("Error in SansthaController.delete:", error);
          res.status(500).json({ message: "Failed to Delete Sanstha", error: error.message });
        }
      }
      


}
