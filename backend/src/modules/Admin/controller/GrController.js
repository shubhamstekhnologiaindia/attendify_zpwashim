import { GRService } from "../services/GrServices.js";
import path from "path";
import multer from "multer";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = "uploads/upload_gr";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname.replace(/\s+/g, "_"));
    }
});

// File filter (allow only images and PDFs)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."), false);
    }
};

// Multer middleware
const upload = multer({ storage, fileFilter });

export const GRController = {
    storeGR: async (req, res) => {
        try {
            const { dept_id, subject, description } = req.body;

            // Validate required fields
            if (!dept_id || !subject || !description) {
                return res.status(400).json({ status: false, message: "All fields are required" });
            }

            let file_upload = req.file ? req.file.path.replace(/\\/g, "/") : null;
            if (file_upload) {
                file_upload = `uploads/upload_gr/${path.basename(file_upload)}`;
            }

            await GRService.insertGR(dept_id, subject, description, file_upload);

            return res.status(200).json({ 
                status: true, 
                message: "GR record stored successfully",
                file: file_upload
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

    editGR: async (req, res) => {
        try {
            const { gr_id, dept_id, subject, description } = req.body;

            if (!gr_id || !dept_id || !subject || !description) {
                return res.status(400).json({ status: false, message: "All fields are required" });
            }

            let file_upload = req.file ? req.file.path.replace(/\\/g, "/") : null;
            if (file_upload) {
                file_upload = `uploads/upload_gr/${path.basename(file_upload)}`;
            }

            await GRService.updateGR(gr_id, dept_id, subject, description, file_upload);

            return res.status(200).json({ 
                status: true, 
                message: "GR record updated successfully",
            });

        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    },

    deleteGR: async (req, res) => {
        try {
            const { gr_id } = req.params;

            if (!gr_id) {
                return res.status(400).json({ status: false, message: "GR ID is required" });
            }

            const result = await GRService.deleteGRService(gr_id); 

            if (result.affectedRows > 0) {
                return res.status(200).json({ status: true, message: "GR deleted successfully" });
            } else {
                return res.status(404).json({ status: false, message: "GR not found" });
            }

        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    },
};
