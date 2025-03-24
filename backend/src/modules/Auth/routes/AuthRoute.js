import express from "express";
// import {authMiddleware} from "../../../Middleware/authMiddleware.js";
import { AuthController,validateLogin } from "../controllers/AuthController.js";

const router = express.Router();


router.post("/login", validateLogin,AuthController .login);

router.post("/register", AuthController.register);



export default router; 


