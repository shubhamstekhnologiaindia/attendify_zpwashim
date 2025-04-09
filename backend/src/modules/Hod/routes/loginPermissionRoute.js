import express from "express";


import { loginPermissionController } from "../controllers/loginPermissioncontroller.js";

const router = express.Router();

router.get("/getUserForLoginPermissions/:permitter_id", loginPermissionController.getUserForLoginPermissions);



export default router;