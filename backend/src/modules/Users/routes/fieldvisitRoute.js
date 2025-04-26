import express from "express";
import { authMiddleware } from "../../../Middleware/authMiddleware.js";


import { fieldVisitController } from "../controllers/fieldvisitController.js";

const router = express.Router();

router.post('/field-visits',authMiddleware, fieldVisitController.createFieldVisit);

export default router; 