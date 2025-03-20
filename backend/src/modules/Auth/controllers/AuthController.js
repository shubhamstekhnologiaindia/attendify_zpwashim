import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import {query} from "../../../../utils/database.js";
import dotenv from "dotenv";


dotenv.config();


export const AuthController = {
    login: async (req, res) => {
        try {
            const { mob_no, password } = req.body;

            // Check if user exists
            const users = await query("SELECT * FROM users WHERE mob_no = ?", [mob_no]);

            if (users.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = users[0];

            // Verify the password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            
            const token = jwt.sign(
                { id: user.id, role_id:user.role_id },
                process.env.JWT_SECRET,
                { algorithm: "HS256", expiresIn: "1h" }
            );
            

            res.json({ message: "Login successful", token });
        } catch (err) {
            res.status(500).json({ message: "Error logging in", error: err.message });

        }
    },

           
   
    register: async (req, res) => {
        try {
            const { 
                name, 
                email, 
                password, 
                mob_no, 
                role_id, 
                department_id, 
                district_id, 
                taluka_id, 
                sanstha_id, 
                village_id, 
                device_id, 
                cader_id 
            } = req.body;
    
            // Validate required fields
            if (!name || !email || !password || !mob_no || !role_id || !department_id || !district_id || !taluka_id || !sanstha_id || !village_id || !cader_id || !device_id) {
                return res.status(400).json({ message: "All fields are required" });
            }
    
            // Hash the password before storing
            const hashedPassword = await bcrypt.hash(password, 8);
    
            // Get epoch timestamp
            const createdAt = Math.floor(Date.now() / 1000);
    
            // Call the stored procedure
            const result = await query(
                "CALL RegisterUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?)",
                [name, email, hashedPassword, mob_no, role_id, department_id, district_id, taluka_id, sanstha_id, village_id, cader_id, createdAt, device_id]
            );
    
            // Log the result to debug
            console.log(result);
    
            // Check if the user was inserted successfully
            if (result && result.affectedRows > 0) {
                return res.status(201).json({ message: "User registered successfully" });
            } else {
                return res.status(400).json({ message: "Failed to register user" });
            }
    
        } catch (err) {
            // Handle specific error for duplicate email
            if (err.message.includes("Email already in use")) {
                return res.status(400).json({ message: "Email already in use" });
            }
            // Handle other errors
            res.status(500).json({ message: "Error registering user", error: err.message });
        }
    }
};


