import express from "express";
import { UserController } from "../controllers/userController.js";
import upload from "../../../middleware/multer.js";
import { authMiddleware } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/user/:id",authMiddleware,UserController.getUserProfile); 
router.post("/register", UserController.RegisterUser); 
router.post("/Send_Registration_OTP", UserController.SendOtp); 
router.put("/update-user/:id",authMiddleware, upload.single("user_profile"), UserController.updateUserProfile);

router.put( "/Update_Profile_Picture/:id",authMiddleware, upload.single("user_profile"), UserController.uploadProfilePicture);


export default router;