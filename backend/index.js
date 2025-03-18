import express from "express";
import db from "./utils/database.js";
import userRoute from "./src/modules/Users/routes/userRoute.js"; 

const app = express();
app.use(express.json());

app.use("/api", userRoute); 

db.sync()
    .then(() => console.log("Database connected & synchronized"))
    .catch(err => console.error("DB Sync Error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
