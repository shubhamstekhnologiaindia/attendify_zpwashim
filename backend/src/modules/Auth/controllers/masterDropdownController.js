import { masterDropdownService } from "../services/masterDropdown.js";

export const MasterDropdown = {
    getDepartments: async (req, res) => {
        try {
            const departments = await masterDropdownService.getDepartments();

            res.status(200).json({
                success: true,
                data: departments
            });
        } catch (error) {
            console.error("Error in DepartmentController - getDepartments:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
};