import express from "express";
// import {authMiddleware} from "../../../Middleware/authMiddleware.js";
import { AuthController} from "../controllers/authController.js";

const router = express.Router();


router.post("/login",AuthController.login);


router.post("/logout",AuthController.logout);

// router.post("/register",AuthController.register);



export default router; 


