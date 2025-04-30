import { SalaryService } from "../services/salaryService.js";

export const SalaryController = {


    saveSalarySlipPermission : async (req, res) => {
        try {
          // Extract user_id and dept_ids from the request body (dept_ids should be an array)
          const { user_id, dept_ids } = req.body;
          const createdBy = req.user?.username || 'system'; // Assuming you track who created it
      
          // Log incoming data for debugging
          console.log("Incoming request data:", { user_id, dept_ids });
      
          // Validate that user_id and dept_ids are provided
          if (!user_id || !dept_ids || !Array.isArray(dept_ids) || dept_ids.length === 0) {
            return res.status(400).json({
              status: false,
              message: "User ID and Department IDs are required, and dept_ids must be an array.",
            });
          }
      
          // Call the service to save the salary slip permissions for the multiple departments
          const result = await SalaryService.saveSalarySlipPermission(user_id, dept_ids);
      
          // Log the result to check what is returned from the service
          console.log("Service result:", result);
      
          return res.status(200).json(result);
          
        } catch (error) {
          // Catch any errors from the controller or service
          console.error("Controller Error (saveSalarySlipPermission):", error);
          return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error"
          });
        }
    },

    updateSalarySlipPermission : async (req, res) => {
        try {
          const { salary_slip_per_id, user_id, dept_id } = req.body;
      
          if (!salary_slip_per_id || !user_id || !dept_id) {
            return res.status(400).json({
              status: false,
              message: "Salary Slip Permission ID, User ID, and Department ID are required.",
            });
          }
      
          const result = await SalaryService.updateSalarySlipPermission(salary_slip_per_id, user_id, dept_id);
      
          return res.status(200).json(result);
      
        } catch (error) {
          console.error("Controller Error (updateSalarySlipPermission):", error);
          return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error"
          });
        }
    },

    deleteSalarySlipPermission : async (req, res) => {
        try {
          const { salary_slip_per_id } = req.params;
      
          if (!salary_slip_per_id) {
            return res.status(400).json({
              status: false,
              message: "Salary Slip Permission ID is required.",
            });
          }
      
          const result = await SalaryService.deleteSalarySlipPermission(salary_slip_per_id);
      
          return res.status(200).json(result);
      
        } catch (error) {
          console.error("Controller Error (updateSalarySlipPermission):", error);
          return res.status(500).json({
            status: false,
            message: error.message || "Internal Server Error"
          });
        }
      },

      checking_salary_slip_per:async (req,res)=>{
        try {
          const { user_id } = req.query
          const result = await SalaryService.checking_salary_slip_per(user_id);
          return res.status(200).json({ status: true, data: result, message: 'Override deleted' })
        } catch (error) {
          return res.status(500).json({ status: false, message:error.message })
        }
      },


      storeSalarySlipRequest: async (req, res) => {
        try {
          const { req_sender_id, req_reciver_id, salary_slip, month, description } = req.body;
    
          if (!req_sender_id || !req_reciver_id || !salary_slip || !month) {
            return res.status(400).json({
              status: false,
              message: "Missing required fields: req_sender_id, req_reciver_id, salary_slip, month",
            });
          }
    
          const result = await SalarySlipsService.storeSalarySlipRequest({
            req_sender_id,
            req_reciver_id,
            salary_slip,
            month,
            description,
          });
    
          return res.status(201).json({
            status: true,
            message: "Salary slip request stored successfully",
            data: result,
          });
        } catch (error) {
          console.error("Error in storeSalarySlipRequest controller:", error);
          return res.status(500).json({
            status: false,
            message: "Failed to store salary slip request",
          });
        }
      },


    
      getListOfSalaryHeads: async (req, res) => {
        try {
          const data = await SalaryService.getListOfSalaryHeads();
          res.status(200).json({ success: true, data });
        } catch (error) {
          console.error("Error fetching salary heads:", error);
          res.status(500).json({ success: false, message: "Server Error" });
        }
      }
}