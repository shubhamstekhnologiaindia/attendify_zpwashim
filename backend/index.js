import express from 'express';
import cors from 'cors';
 
import Route from "./src/modules/Auth/routes/AuthRoute.js";
import dotenv from "dotenv";
dotenv.config();

import AuthRoute from "./src/modules/Auth/routes/AuthRoute.js";
import attendanceRoutes from "./src/modules/Users/routes/attendanceRoutes.js";
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
app.use('/api/auth', AuthRoute);
app.use('/api/attendance', attendanceRoutes);
 
const PORT = process.env.PORT || 3008;
 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
