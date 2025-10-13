import express from "express";

import {authMiddleware} from "../../../Middleware/authMiddleware.js";

import { loginPermissionController } from "../controllers/loginPermissioncontroller.js";

const router = express.Router();

router.get("/getUserForLoginPermissions/:permitter_id",authMiddleware, loginPermissionController.getUserForLoginPermissions);

router.get("/getAllUsers/:department_id?", authMiddleware, loginPermissionController.getAllUsersByDepartment);

// router.get("/getUsersByLocationAndDepartment", loginPermissionController.getUsersByLocationAndDepartmentController);
router.get( "/getUsersByLocationAndDepartment",loginPermissionController.getUsersByLocationAndDepartmentController
);

export default router;