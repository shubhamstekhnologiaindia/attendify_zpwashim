import express from 'express';
import cors from 'cors';
 
import dotenv from "dotenv";
dotenv.config();

import AuthRoute from "./src/modules/Auth/routes/AuthRoute.js";
import dropdownRoute from "./src/modules/Auth/routes/dropdownRoute.js";
import attendanceRoutes from "./src/modules/Users/routes/attendanceRoutes.js";
import hodRoutes from "./src/modules/Hod/routes/hodroutes.js";
import GrRoutes from "./src/modules/Admin/routes/GrRoutes.js";

import SendmsgRoute from "./src/modules/Admin/routes/MsgRoute.js";
import  HqRoutes from "./src/modules/Admin/routes/HqRoutes.js";


// import notificationRoutes from "./src/modules/BirthdayNotification/routes/notification.routes.js";

const app = express();
 
app.use(cors());
app.use(express.json());
 
app.use('/api/auth', AuthRoute);
app.use('/api', dropdownRoute, hodRoutes,attendanceRoutes,GrRoutes,SendmsgRoute,HqRoutes);

const PORT = 3001
 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

