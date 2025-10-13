
import { loginPermission } from "../services/loginPermissionService.js";

export const loginPermissionController = {

    getUserForLoginPermissions: async (req, res) => {
        try {
            const { permitter_id } = req.params; // Assuming mentorUser Id is passed as a URL parameter


            // console.log("hdgwuih")
            if (!permitter_id) {
                return res.status(400).json({ status: false, message: "mentorUser Id is required" });
            }

            const users = await loginPermission.getUserForLoginPermissions(permitter_id);

            if (!users) {
                return res.status(404).json({ status: false, message: "No users found for this mentor" });
            }

            return res.status(200).json({ status: true, data: users });
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    },

    getAllUsersByDepartment: async (req, res) => {
        try {
            const { department_id } = req.query;

            const users = await loginPermission.getAllUsersByDepartment(department_id || null);

            if (!users || users.length === 0) {
                return res.status(404).json({ status: false, message: "No users found" });
            }

            return res.status(200).json({ status: true, data: users });
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    },


     getUsersByLocationAndDepartmentController: async (req, res) => {
    try {
      const { location_id, department_id } = req.query;

      if (!location_id) {
        return res.status(400).json({
          status: false,
          message: "location_id is required",
        });
      }

      // ✅ FIX: Call service method correctly
      const users = await loginPermission.getUsersByLocationAndDepartment(location_id, department_id);

      if (!users || users.length === 0) {
        return res.status(404).json({
          status: false,
          message: "No users found for given filters",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error) {
      console.error("Error in getUsersByLocationAndDepartmentController:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },
};