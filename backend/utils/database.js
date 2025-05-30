import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS|| "",
    database: process.env.DB_NAME || 'attends-zp-washim-uat',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // timezone: 'local' 
});
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to the database');
        connection.release(); 
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1); 
    }
})();
const query = async (sql, values = []) => {
    try {
        const [results] = await pool.query(sql, values);
        return results;
    } catch (err) {
        console.error('Error executing query:', err.message);
        throw err;
    }
};

export { pool, query };
