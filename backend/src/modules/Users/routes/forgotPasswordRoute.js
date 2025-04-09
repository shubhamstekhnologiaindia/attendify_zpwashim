import express from 'express';
import { ForgotPasswordController } from '../controllers/forgotPasswordController.js'; // ✅ Correct

const router = express.Router();


router.post("/forgot-password", ForgotPasswordController.forgotPassword); 

export default router;