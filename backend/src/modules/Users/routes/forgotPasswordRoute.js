import express from 'express';
import { ForgotPasswordController } from '../controllers/forgotPasswordController.js'; // ✅ Correct
import { authMiddleware } from "../../../Middleware/authMiddleware.js";

const router = express.Router();


router.post("/forgot-password", ForgotPasswordController.forgotPassword); 

export default router;