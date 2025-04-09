import express from "express";
import { UserController } from "../controllers/userController.js";
import upload from "../../../middleware/multer.js";

const router = express.Router();

router.get("/user/:id", UserController.getUserProfile); 


router.post("/Register_User", UserController.RegisterUser); 

router.post("/Send_Registration_OTP", UserController.SendOtp); 


router.put("/update-user/:id", upload.single("user_profile"), UserController.updateUserProfile);

export default router;