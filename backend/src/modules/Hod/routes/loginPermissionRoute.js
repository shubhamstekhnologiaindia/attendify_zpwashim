import express from "express";

import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import { loginPermissionController } from "../controllers/loginPermissioncontroller.js";

const router = express.Router();

router.get("/getUserForLoginPermissions/:permitter_id",authMiddleware, loginPermissionController.getUserForLoginPermissions);



export default router;