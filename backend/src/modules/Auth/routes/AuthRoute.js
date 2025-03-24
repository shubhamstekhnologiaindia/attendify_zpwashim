import express from "express";
// import {authMiddleware} from "../../../Middleware/authMiddleware.js";
import { AuthController,validateLogin,validateRegister } from "../controllers/authController.js";

const router = express.Router();


router.post("/login", validateLogin,AuthController .login);

router.post("/register", validateRegister,AuthController.register);



export default router; 


