import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // Set to `console.log` to debug queries
});

// ✅ Check if Database is Connected
(async () => {
    try {
        await db.authenticate();
        console.log("✅ Database is connected successfully!");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
    }
})();

export default db;
