import express from "express";
import { UserController } from "../controllers/userController.js";

const router = express.Router();

router.get("/user/:id", UserController.getUserProfile); 


router.post("/Register_User", UserController.RegisterUser); 

router.post("/Send_Registration_OTP", UserController.SendOtp); 

export default router;