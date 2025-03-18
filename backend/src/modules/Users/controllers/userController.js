import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();


export const userController = {
    getProfile: async (req) => {
        try {
            const userId = req.user.id;

            // Fetch user data without password
            const [users] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [userId]);
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
            const { name, email, password } = req.body;

            // Check if user already exists
            const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
            if (existingUsers.length > 0) {
                return res.status(400).json({ message: "Email already in use" });
            }

            // Hash password before storing
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into database
            const [result] = await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

            res.status(201).json({ message: "User registered successfully", userId: result.insertId });
        } catch (err) {
            res.status(500).json({ message: "Error registering user", error: err.message });
        }
    },




    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Fetch user by email
            const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
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


