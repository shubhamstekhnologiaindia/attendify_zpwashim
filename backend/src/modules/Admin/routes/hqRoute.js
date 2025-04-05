import express from "express";
import { HeadQuarterController } from "../controllers/HqController.js";


const router = express.Router();


router.get("/fetchHOD", HeadQuarterController.FetchHOD); 


export default router;
