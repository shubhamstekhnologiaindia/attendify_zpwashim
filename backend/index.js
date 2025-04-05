// import express from 'express';
// import cors from 'cors';
 
// import dotenv from "dotenv";
// dotenv.config();

// import AuthRoute from "./src/modules/Auth/routes/AuthRoute.js";
// import dropdownRoute from "./src/modules/Auth/routes/dropdownRoute.js";
// import attendanceRoutes from "./src/modules/Users/routes/attendanceRoutes.js";
// import hodRoutes from "./src/modules/Hod/routes/hodRoutes.js";
// import GrRoutes from "./src/modules/Admin/routes/GrRoutes.js";
// import UserRoutes from "./src/modules/Users/routes/userRoutes.js";
// import notificationRoutes from "./src/modules/BirthdayNotification/routes/notification.routes.js";

// // import notificationRoutes from "./src/modules/BirthdayNotification/routes/notification.routes.js";


 
// const app = express();
 
// app.use(cors());
// app.use(express.json());
 
// app.use('/api/auth', AuthRoute);
// app.use('/api', dropdownRoute, hodRoutes,attendanceRoutes,GrRoutes,UserRoutes,notificationRoutes);

// const PORT = process.env.PORT || 3008;
 
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// })


import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();

import AuthRoute from "./src/modules/Auth/routes/AuthRoute.js";
import dropdownRoute from "./src/modules/Auth/routes/dropdownRoute.js";
import attendanceRoutes from "./src/modules/Users/routes/attendanceRoutes.js";
import hodRoutes from "./src/modules/Hod/routes/hodRoutes.js";
import GrRoutes from "./src/modules/Admin/routes/GrRoutes.js";
<<<<<<< HEAD

import SendmsgRoute from "./src/modules/Admin/routes/MsgRoute.js";
import  HqRoutes from "./src/modules/Admin/routes/HqRoutes.js";


// import notificationRoutes from "./src/modules/BirthdayNotification/routes/notification.routes.js";
=======
import notificationRoutes from "./src/modules/BirthdayNotification/routes/notification.routes.js";
>>>>>>> 8811d33d3fc27322bbd7847ebbd87eb065881afe

const app = express();
 
app.use(cors());
app.use(express.json());
// Serve static files from 'uploads' directory
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', AuthRoute);
<<<<<<< HEAD
app.use('/api', dropdownRoute, hodRoutes,attendanceRoutes,GrRoutes,SendmsgRoute,HqRoutes);
=======
app.use('/api', dropdownRoute, hodRoutes,attendanceRoutes,GrRoutes,notificationRoutes);
>>>>>>> 8811d33d3fc27322bbd7847ebbd87eb065881afe

const PORT = 3001
 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

