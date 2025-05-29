import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from "dotenv";
import  {initializeNotificationSchedules}  from "./src/modules/BirthdayNotification/services/afternoonBreakNotifyService.js";
dotenv.config();
import './utils/cronJobs.js';


import AuthRoute from "./src/modules/Auth/routes/authRoute.js";
import masterDataRoute from "./src/modules/MasterData/routes/masterDataRoute.js";
import attendanceRoute from "./src/modules/Users/routes/attendanceRoute.js";
import fieldvisitRoute from "./src/modules/Users/routes/fieldvisitRoute.js";

import hodRoutes from "./src/modules/Hod/routes/hodRoute.js";
import GrRoutes from "./src/modules/Admin/routes/grRoute.js";

import SendmsgRoute from "./src/modules/Admin/routes/msgRoute.js";
import  HqRoutes from "./src/modules/Admin/routes/hqRoute.js";
import  holidayRoute from "./src/modules/WebDashboard/routes/holidayRoute.js";
import  birthdayRoute from "./src/modules/WebDashboard/routes/birthdayRoute.js";
import  attendanceCountRoute from "./src/modules/WebDashboard/routes/attendanceCountRoute.js";

import loginPermissionRoutes from "./src/modules/Hod/routes/loginPermissionRoute.js";
import UserRoute from "./src/modules/Users/routes/userRoute.js";
import otpRoute from "./src/modules/Users/routes/otpRoute.js";
import forgotPasswordRoute from "./src/modules/Users/routes/forgotPasswordRoute.js";

import notificationRoutes from "./src/modules/BirthdayNotification/routes/notificationRoute.js";

import sansthaRoute from "./src/modules/sanstha/routes/sansthaRoute.js";

import reportsRoute from "./src/modules/Reports/routes/reportRoute.js";

import shiftRoute from "./src/modules/Shifts/routes/shiftRoute.js"

import orrShiftRoute from "./src/modules/Shifts/routes/orrShiftRoute.js"

import salaryRoute from "./src/modules/Salary/routes/salaryRoute.js";




const app = express();
 
app.use(cors());
app.use(express.json());
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', AuthRoute);

app.use('/api', masterDataRoute, hodRoutes,attendanceRoute,GrRoutes,SendmsgRoute,HqRoutes,notificationRoutes,holidayRoute, birthdayRoute,UserRoute,otpRoute,
  loginPermissionRoutes,reportsRoute,attendanceCountRoute,forgotPasswordRoute,shiftRoute,sansthaRoute,fieldvisitRoute,orrShiftRoute,salaryRoute);



  // Initialize the afternoon attendance notification scheduler
initializeNotificationSchedules()
  .then(() => console.log('✅ Afternoon attendance notification scheduler initialized'))
  .catch((error) => console.error('❌ Failed to initialize afternoon attendance notification scheduler:', error));

const PORT = 3001
 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})


// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('ℹ️ Shutting down server');
  process.exit(0);
});
