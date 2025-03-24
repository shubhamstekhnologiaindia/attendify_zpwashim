import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";
import {MasterDropdown} from "../controllers/masterDropdownController.js";
const router = express.Router();

// Route to fetch all departments

router.get("/show/departments", authMiddleware,MasterDropdown.getDepartments);

export default router;
