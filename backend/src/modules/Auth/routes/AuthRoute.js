import express from "express";
// import  {authMiddleware }  from "../../../Middleware/authMiddleware.js";


import {authMiddleware} from "../../../Middleware/authMiddleware.js";
import { AuthController } from "../controllers/AuthController.js";


const router = express.Router();


router.post("/login", AuthController.login);




// User routes
router.post("/register", AuthController.register);



export default router; // ✅ Ensure this line exists
