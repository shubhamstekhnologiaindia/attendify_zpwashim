import express from "express";
import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import {SansthaController} from "../controllers/sansthaController.js";

const router = express.Router();



router.post("/Add_Sanstha",SansthaController.addSanstha);
router.put("/Update_Sanstha",SansthaController.updateSanstha);
router.delete("/Delete_Sanstha",SansthaController.deleteSanstha);


export default router;


