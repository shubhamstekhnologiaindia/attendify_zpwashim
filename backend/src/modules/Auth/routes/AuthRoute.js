import express from "express";
import  {authMiddleware }  from "../../../Middleware/authMiddleware.js";

import  {userController}  from "../controllers/AuthController.js";


const router = express.Router();


router.post("/login", userController.login);



export default router; 
