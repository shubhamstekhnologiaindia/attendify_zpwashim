import express from "express";
import { HeadQuarterController } from "../controllers/hqController.js";

import {authMiddleware} from "../../../Middleware/authMiddleware.js";

const router = express.Router();


// router.get("/fetchHOD", HeadQuarterController.FetchHOD); 

router.get('/fetchHOD', HeadQuarterController.FetchHOD);
export default router;
