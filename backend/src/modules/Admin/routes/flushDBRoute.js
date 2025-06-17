
// import express from "express";
// import { FlushDBController } from "../controllers/flushDBController.js";
// import {authMiddleware} from "../../../middleware/authMiddleware.js";

// const router = express.Router();

import express from 'express';
import { FlushDBController } from '../controllers/flushDBController.js';

const router = express.Router();
router.post('/send-mobile-otp', FlushDBController.sendMobileOtp);
router.post('/verify-mobile-otp', FlushDBController.verifyMobileOtp);
router.post('/verify-email-otp', FlushDBController.verifyEmailOtp);
router.post('/flush', FlushDBController.flushTable);

export default router;