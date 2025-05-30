import express from "express";
import {authMiddleware} from "../../../middleware/authMiddleware.js";

import {SansthaController} from "../controllers/sansthaController.js";

const router = express.Router();



router.post("/Add_Sanstha",authMiddleware,SansthaController.addSanstha);
router.put("/Update_Sanstha",authMiddleware,SansthaController.updateSanstha);
router.delete("/Delete_Sanstha",authMiddleware,SansthaController.deleteSanstha);


export default router;


