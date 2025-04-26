import express from 'express';
import { otpController } from '../controllers/otpController.js'; // Corrected import name
import { authMiddleware } from "../../../Middleware/authMiddleware.js";

const router = express.Router();

router.post('/send-otp',authMiddleware, otpController.sendOtp);
router.post('/verify-otp',authMiddleware, otpController.verifyOtp);

export default router;