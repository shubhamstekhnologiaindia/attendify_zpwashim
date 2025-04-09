import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();

import AuthRoute from "./src/modules/Auth/routes/AuthRoute.js";
import masterDataRoute from "./src/modules/MasterData/routes/masterDataRoute.js";
import attendanceRoute from "./src/modules/Users/routes/attendanceRoute.js";
import userRoute from "./src/modules/Users/routes/userRoute.js";
import hodRoutes from "./src/modules/Hod/routes/hodRoute.js";
import GrRoutes from "./src/modules/Admin/routes/GrRoute.js";
import UserRoutes from "./src/modules/Users/routes/userRoute.js";
import GrRoutes from "./src/modules/Admin/routes/grRoute.js";

import SendmsgRoute from "./src/modules/Admin/routes/msgRoute.js";
import  HqRoutes from "./src/modules/Admin/routes/hqRoute.js";
import  holidayRoute from "./src/modules/WebDashboard/routes/holidayRoute.js";
import  birthdayRoute from "./src/modules/WebDashboard/routes/birthdayRoute.js";

import loginPermissionRoutes from "./src/modules/Hod/routes/loginPermissionRoute.js";
import UserController from "./src/modules/Users/routes/userRoute.js";
import otpRoute from "./src/modules/Users/routes/otpRoute.js";

import notificationRoutes from "./src/modules/BirthdayNotification/routes/notificationRoute.js";

const app = express();
 
app.use(cors());
app.use(express.json());
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', AuthRoute);
app.use('/api', masterDataRoute, hodRoutes,attendanceRoute,GrRoutes,SendmsgRoute,HqRoutes,UserRoutes, notificationRoutes, holidayRoute, birthdayRoute);

const PORT = 3001
 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

