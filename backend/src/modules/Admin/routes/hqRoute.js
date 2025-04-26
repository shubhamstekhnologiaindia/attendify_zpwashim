import express from "express";
import { HeadQuarterController } from "../controllers/HqController.js";

import {authMiddleware} from "../../../Middleware/authMiddleware.js";

const router = express.Router();


router.get("/fetchHOD",authMiddleware, HeadQuarterController.FetchHOD); 


export default router;
