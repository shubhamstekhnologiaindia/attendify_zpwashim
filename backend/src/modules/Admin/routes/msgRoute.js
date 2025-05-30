

import express from "express";
import  {MsgController}  from "../controllers/MsgController.js";
import {authMiddleware} from "../../../middleware/authMiddleware.js";
import upload from "../../../middleware/multer.js";

const router = express.Router();

router.get("/SendMessage",authMiddleware, MsgController.MsgController);


export default router;

