import { GRService } from "../services/grServices.js";
import path from "path";
import multer from "multer";
import fs from "fs";


export const GRController = {

   uploadGrToAzure: async (req, res) => {
    try {
  
        const file_upload = req.file;

        if (!file_upload) {
            return res.status(400).json({
                status: false,
                message: 'No file uploaded.',
            });
        }
        const { dept_id, subject, description } = req.body;
        if (!dept_id || !subject || !description) {
            return res.status(400).json({ status: false, message: "All fields are required" });
        }

        const result = await GRService.uploadGrToAzure(dept_id, subject, description, file_upload);
        return res.status(200).json({
            status: true,
            message: 'File uploaded successfully!',
            blobUrl: result.blobUrl,
        });
    } catch (error) {
        console.error('Error uploading file:', error.message || error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while uploading file.',
        });
    }
},
  getGRByDepartment: async (req, res) => {
    try {
      // dept_id can come from a route param or query string
      const deptId = req.params.dept_id
      const records = await GRService.getGRByDepartment(deptId);

      return res.status(200).json({
        status: true,
        data: records,
      });
    } catch (error) {
      console.error('Error fetching GR records:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal server error while fetching records.',
      });
    }
  },

  // 2. Update an existing GR record (with optional new file)
  updateGR: async (req, res) => {
    try {
    
      const { dept_id, subject, description,gr_id } = req.body;
      const fileUpload = req.file; // may be undefined if no new file sent

      // Basic validation
      if (!gr_id || !dept_id || !subject || !description) {
        return res.status(400).json({
          status: false,
          message: 'gr_id, dept_id, subject and description are all required.',
        });
      }

      // Call service — it will delete old blob if fileUpload is present
      await GRService.updateGR(
        gr_id,
        dept_id,
        subject,
        description,
        fileUpload
      );

      return res.status(200).json({
        status: true,
        message: 'GR record updated successfully.',
      });
    } catch (error) {
      console.error('Error updating GR record:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal server error while updating record.',
      });
    }
  },

  // 3. Delete a GR record (and its blob in Azure)
  deleteGR: async (req, res) => {
    try {
      const gr_id = req.params.gr_id;
      if (!gr_id) {
        return res.status(400).json({
          status: false,
          message: 'gr_id is required.',
        });
      }

      await GRService.deleteGRService(gr_id);

      return res.status(200).json({
        status: true,
        message: 'GR record deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting GR record:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal server error while deleting record.',
      });
    }
  },
};


