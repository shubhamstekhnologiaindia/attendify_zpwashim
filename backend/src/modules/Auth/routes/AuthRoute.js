import express from "express";
import authMiddleware from "../../../middleware/authMiddleware.js";
import { AuthController } from "../controllers/AuthController.js";


const router = express.Router();

// User routes
router.post("/register", AuthController.register);



export default router; // ✅ Ensure this line exists
