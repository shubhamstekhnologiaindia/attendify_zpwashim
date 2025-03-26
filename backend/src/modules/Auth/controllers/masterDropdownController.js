import { masterDropdownService } from "../services/masterDropdownService.js";

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

    getOfficeLocationsByDepartmentId: async (req, res) => {
        try {
            const { departmentId } = req.params;

            if (!departmentId || isNaN(departmentId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID"
                });
            }

            const locations = await masterDropdownService.getOfficeLocationsByDepartmentId(departmentId)
            res.status(200).json({
                success: true,
                data: locations
            });
        } catch (error) {
            console.error("Error in MasterDropdown - getOfficeLocationsByDepartmentId:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },

    getCadresByOfficeLocationId: async (req, res) => {
        try {
          const { officeLocationId } = req.params;
          
          if (!officeLocationId || isNaN(officeLocationId)) {
            return res.status(400).json({
              success: false,
              message: "Invalid office location ID"
            });
          }
    
          const cadres = await masterDropdownService.getCadresByOfficeLocationId(officeLocationId);
          
          res.status(200).json({
            success: true,
            data: cadres
          });
        } catch (error) {
          console.error("Error in OfficeCadreController - getCadresByOfficeLocationId:", error);
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