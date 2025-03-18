import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


import {query} from "../../../../utils/database.js";

dotenv.config();


export const userController = {
    getProfile: async (req) => {
        try {
            const userId = req.user.id;

            // Fetch user data without password
            const [users] = await query("SELECT id, name, email FROM users WHERE id = ?", [userId]);
            if (users.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(users[0]);
        } catch (err) {
            res.status(500).json({ message: "Error fetching profile", error: err.message });
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
                cader_id 
            } = req.body;
    
            // Validate required fields
            if (!name || !email || !password || !mob_no || !role_id || !department_id || !district_id || !taluka_id || !sanstha_id || !village_id || !cader_id) {
                return res.status(400).json({ message: "All fields are required" });
            }
    
            // Hash the password before storing
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Call the stored procedure
            const [result] = await query("CALL RegisterUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @user_id, @status)", 
                [name, email, hashedPassword, mob_no, role_id, department_id, district_id, taluka_id, sanstha_id, village_id, cader_id]
            );
    
            // Get output values
            const [output] = await query("SELECT @user_id AS userId, @status AS status");
    
            if (output[0].status === "Email already in use") {
                return res.status(400).json({ message: "Email already in use" });
            }
    
            res.status(201).json({ message: output[0].status, userId: output[0].userId });
    
        } catch (err) {
            res.status(500).json({ message: "Error registering user", error: err.message });
        }
    },
    
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Fetch user by email
            const [users] = await query("SELECT * FROM users WHERE email = ?", [email]);
            if (users.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = users[0];

            // Validate password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Generate JWT Token
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

            res.json({ message: "Login successful", token });
        } catch (err) {
            res.status(500).json({ message: "Error logging in", error: err.message });
        }
    }
};


