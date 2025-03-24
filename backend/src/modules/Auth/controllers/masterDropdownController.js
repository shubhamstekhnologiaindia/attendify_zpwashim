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
    },

    getTalukas: async (req, res) => {
        try {
            const talukas = await masterDropdownService.getTalukas();
            res.status(200).json({ success: true, data: talukas });
        } catch (error) {
            console.error("Error in TalukaController - getTalukas:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getVillagesByTalukaId: async (req, res) => {
        try {
            const { talukaId } = req.params;

            if (!talukaId) {
                return res.status(400).json({ success: false, message: "Taluka ID is required" });
            }

            const villages = await masterDropdownService.getVillagesByTalukaId(talukaId);
            res.status(200).json({ success: true, data: villages });
        } catch (error) {
            console.error("Error in VillageController - getVillagesByTalukaId:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

};