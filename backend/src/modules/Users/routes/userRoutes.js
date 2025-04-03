import express from "express";
import { UserController } from "../controllers/UserController.js";

const router = express.Router();

router.get("/user/:id", UserController.getUserProfile); // API endpoint for getting user details

export default router;