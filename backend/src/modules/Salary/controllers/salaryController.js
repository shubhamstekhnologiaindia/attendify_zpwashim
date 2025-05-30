import { SalaryService } from "../services/salaryService.js";


export const SalaryController = {
  saveSalarySlipPermission: async (req, res) => {
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

  updateSalarySlipPermission: async (req, res) => {
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

  deleteSalarySlipPermission: async (req, res) => {
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

  checking_salary_slip_per: async (req, res) => {
    try {
      const { user_id } = req.query
      const result = await SalaryService.checking_salary_slip_per(user_id);
      return res.status(200).json({ status: true, data: result, message: 'Permission Fetched Successfully' })
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message })
    }
  },


  storeSalarySlipRequest: async (req, res) => {
    try {
      const { req_sender_id, req_reciver_id,  month, description } = req.body;

      if (!req_sender_id || !req_reciver_id || !month) {
        return res.status(400).json({
          status: false,
          message: "Missing required fields: req_sender_id, req_reciver_id, month",
        });
      }
      const result = await SalaryService.storeSalarySlipRequest({
        req_sender_id,
        req_reciver_id,
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
      },

   getSalarySlips :async (req, res) => {
    const userId = req.user.id

    console.log(req.user)
  
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ status: false, message: 'Invalid or missing userId' });
    }
    try {
      const slips = await SalaryService.FetchUsersForSalarySlip(userId);
  
      if (!slips || slips.length === 0) {
        return res.status(404).json({ status: false, message: 'No salary slips found for this user.' });
      }
  
      return res.status(200).json({ status: true, data: slips });
    } catch (error) {
      console.error('Error fetching salary slips:', error.message);
      return res.status(500).json({ status: false, message: 'Internal server error' });
    }
  },


  uploadSalarySlipToAzure: async (req, res) => {
    try {
      const files = req.files || [];
  
      // 1. Validate file count
      if (files.length === 0) {
        return res.status(400).json({
          status: false,
          message: 'No file uploaded.',
        });
      }
  
      if (files.length > 1) {
        return res.status(400).json({
          status: false,
          message: 'Only one file is allowed.',
        });
      }
  
      const file = files[0];
      const { application_id } = req.body;
  
      if (!application_id) {
        return res.status(400).json({
          status: false,
          message: 'Missing user ID.',
        });
      }
  
      // 2. Upload to Azure and update DB
      const result = await SalaryService.uploadSalarySlipToAzure(application_id, file);
  
      return res.status(200).json({
        status: true,
        message: 'File uploaded successfully!',
        blobUrl: result.blobUrl,
      });
  
    } catch (error) {
      console.error('Error uploading salary slip:', error.message || error);
      return res.status(500).json({
        status: false,
        message: 'Internal server error while uploading salary slip.',
      });
    }
  },
  // fetch salary head in dropdown
  listSalarySlipPermissions: async (req, res) => {
    try {
      const permissions = await SalaryService.listSalarySlipPermissions();

      return res.status(200).json({
        status: true,
        message: "Salary slip permissions retrieved successfully",
        data: permissions,
      });
    } catch (error) {
      console.error("Error in listSalarySlipPermissions controller:", error);
      return res.status(500).json({
        status: false,
        message: "Failed to retrieve salary slip permissions",
      });
    }
  },


  // show salry slips request in mobile

  listSalarySlipsBySender: async (req, res) => {
    try {
      const { req_sender_id } = req.body;

      if (!req_sender_id) {
        return res.status(400).json({
          status: false,
          message: "req_sender_id is required",
        });
      }

      const slips = await SalaryService.listSalarySlipsBySender(req_sender_id);

      return res.status(200).json({
        status: true,
        message: "Salary slip requests retrieved successfully",
        data: slips,
      });
    } catch (error) {
      console.error("Error in listSalarySlipsBySender controller:", error.message);
      return res.status(500).json({
        status: false,
        message: error.message || "Failed to retrieve salary slip requests",
      });
    }
  },
    rejectSalarySlipRequest: async (req, res) => {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Missing salary slip id' });
    }

    try {
      const result = await SalaryService.rejectSalarySlipRequest(id);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Salary slip not found' });
      }

      return res.status(200).json({ message: 'Salary slip Request Rejected Successdully' });
    } catch (error) {
      console.error('Error updating salary slip status:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },
}









