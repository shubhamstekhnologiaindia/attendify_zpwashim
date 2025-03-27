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
    getGRByDepartment: async (req, res) => {
        try {
            const { dept_id } = req.params;
    
            if (!dept_id) {
                return res.status(400).json({ status: false, message: "Department ID is required" });
            }
    
            const grRecords = await GRService.getGRByDepartment(dept_id);
    
            return res.status(200).json({ 
                status: true, 
                data: grRecords 
            });
    
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }
};
