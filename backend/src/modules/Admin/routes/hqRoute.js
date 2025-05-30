import express from "express";
import { HeadQuarterController } from "../controllers/hqController.js";

import {authMiddleware} from "../../../middleware/authMiddleware.js";

const router = express.Router();


// router.get("/fetchHOD", HeadQuarterController.FetchHOD); 

router.get('/fetchHOD',authMiddleware,HeadQuarterController.FetchHOD);
export default router;
