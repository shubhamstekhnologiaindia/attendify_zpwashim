import express from 'express';
import cors from 'cors';
 
// import {route} from './modules/Users/Routes/userRoute.js';

import Route from "./src/modules/Users/routes/userRoute.js";


// import route from './..Routes/route.js';
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
app.use('/api', Route);
 
const PORT = process.env.PORT || 3008;
 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
