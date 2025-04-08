



import { loginPermission } from "../services/loginPermissionService.js";


export const loginPermissionController = {

    getUserForLoginPermissions: async (req, res) => {
        try {
            const { permitter_id } = req.params; // Assuming mentorUser Id is passed as a URL parameter


            console.log("hdgwuih")
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
    }
};