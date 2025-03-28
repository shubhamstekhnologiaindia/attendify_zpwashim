import express from "express";
import  { hodController}  from "../controllers/hodController.js";

const router = express.Router();

router.get("/hod/employees/:hod_id", hodController.getEmployeesByHodController);

export default router;
