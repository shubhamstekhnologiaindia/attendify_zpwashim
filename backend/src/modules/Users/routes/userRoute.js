import express from "express";
import { UserController } from "../controllers/userController.js";

const router = express.Router();

router.get("/user/:id", UserController.getUserProfile); 

export default router;