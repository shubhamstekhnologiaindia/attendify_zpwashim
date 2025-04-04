import { GRService } from "../services/GrServices.js";
import path from "path";

export const GRController = {
   
    
    storeGR: async (req, res) => {
        try {
            const { dept_id, subject, description } = req.body;
    
            if (!dept_id || !subject || !description) {
                return res.status(400).json({ status: false, message: "All fields are required" });
            }
        // console.log(req.body)

        let file_upload = req.file ? req.file.path.replace(/\\/g, "/") : null;

        if (file_upload) {
            file_upload = `gr_uploads/${path.basename(file_upload)}`;
        }
            console.log("File Path:", file_upload); // Debugging
    
            await GRService.insertGR(dept_id, subject, description, file_upload);
    
            return res.status(200).json({ 
                status: true, 
                message: "GR record stored successfully",
            });
    
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    },
    editGR: async (req, res) => {
        try {
            const { gr_id, dept_id, subject, description } = req.body;
    
            if (!gr_id || !dept_id || !subject || !description) {
                return res.status(400).json({ status: false, message: "All fields are required" });
            }
    
            let file_upload = req.file ? req.file.path.replace(/\\/g, "/") : null;
    
            if (file_upload) {
                file_upload = `gr_uploads/${path.basename(file_upload)}`;
            }
    
            console.log("File Path:", file_upload); // Debugging
    
            await GRService.updateGR(gr_id, dept_id, subject, description, file_upload);
    
            return res.status(200).json({ 
                status: true, 
                message: "GR record updated successfully",
            });
    
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    },
    getGRByDepartment: async (req, res) => {
        try {
            const { dept_id } = req.params;

            const grRecords = await GRService.getGRByDepartment(dept_id);

            return res.status(200).json({ 
                status: true, 
                data: grRecords 
            });

        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    },
    deleteGR:async (req, res) => {
        try {
            const { gr_id } = req.params;
    
            if (!gr_id) {
                return res.status(400).json({ status: false, message: "GR ID is required" });
            }
    
            const result = await GRService.deleteGRService(gr_id); 
    
            // console.log("Delete Service Response:", result); // Debugging
    
            if (result.affectedRows > 0) {
                return res.status(200).json({ status: true, message: "GR deleted successfully" });
            } else {
                return res.status(404).json({ status: false, message: "GR not found" });
            }
    
        } catch (error) {
            console.error("Error deleting GR:", error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }
};
