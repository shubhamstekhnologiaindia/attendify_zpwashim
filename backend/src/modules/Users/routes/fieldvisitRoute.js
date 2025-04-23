import express from "express";


import { fieldVisitController } from "../controllers/fieldvisitController.js";

const router = express.Router();

router.post('/field-visits', fieldVisitController.createFieldVisit);

export default router; 