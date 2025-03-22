import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
// Create a connection pool for the database

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'attendify_zp_washim',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to the database');
        connection.release(); // Release the connection back to the pool
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1); // Exit the process if connection fails
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

export { query };


