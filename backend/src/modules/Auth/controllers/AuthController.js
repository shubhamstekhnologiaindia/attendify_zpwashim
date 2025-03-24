import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import {query} from "../../../../utils/database.js";
import dotenv from "dotenv";


dotenv.config();


// Validation Middleware
export const validateLogin = [
    check("mob_no")
        .trim()
        .notEmpty().withMessage("Mobile number is required")
        .isNumeric().withMessage("Mobile number must be numeric")
        .isLength({ min: 10, max: 10 }).withMessage("Mobile number must be 10 digits"),
    check("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];
export const validateRegister = [
    check("first_name")
        .trim()
        .notEmpty().withMessage("First name is required")
        .matches(/^[A-Za-z]+$/).withMessage("First name must contain only letters, no spaces or special characters"),

    check("middle_name")
        .trim()
        .notEmpty().withMessage("Middle name is required")
        .matches(/^[A-Za-z]+$/).withMessage("Middle name must contain only letters, no spaces or special characters"),

    check("last_name")
        .trim()
        .notEmpty().withMessage("Last name is required")
        .matches(/^[A-Za-z]+$/).withMessage("Last name must contain only letters, no spaces or special characters"),

    check("mob_no")
        .trim()
        .notEmpty().withMessage("Mobile number is required")
        .isNumeric().withMessage("Mobile number must be numeric")
        .isLength({ min: 10, max: 10 }).withMessage("Mobile number must be exactly 10 digits"),

    check("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/\d/).withMessage("Password must contain at least one number")
        .matches(/[\W_]/).withMessage("Password must contain at least one special character")
        .not().matches(/\s/).withMessage("Password must not contain spaces"),
];

export const AuthController  = {
    // login: async (req, res) => {
    //     try {
    //         const { mob_no, password } = req.body;

    //         // Check if user exists
    //         const users = await query("SELECT * FROM users WHERE mob_no = ?", [mob_no]);

    //         if (users.length === 0) {
    //             return res.status(404).json({ message: "User not found" });
    //         }

    //         const user = users[0];

    //         // Verify the password
    //         const isMatch = await bcrypt.compare(password, user.password);
    //         if (!isMatch) {
    //             return res.status(401).json({ message: "Invalid credentials" });
    //         }

    //         // Generate JWT Token
    //         // const token = jwt.sign(
    //         //     { id: user.id, mob_no: user.mob_no },
    //         //     process.env.JWT_SECRET,
    //         //     { expiresIn: "1h" }
    //         // );

    //         const token = jwt.sign(
    //             { id: user.id, mob_no: user.mob_no },
    //             process.env.JWT_SECRET,
    //             { algorithm: "HS256", expiresIn: "1h" }
    //         );
            

    //         res.json({ message: "Login successful", token, user });
    //     } catch (err) {
    //         res.status(500).json({ message: "Error logging in", error: err.message });

    //     }
    // },
    login: async (req, res) => {
        try {
            // Validate Request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

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

            // Generate JWT Token
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
           
        // register: async (req, res) => {
        //     try {
        //         const { 
        //             first_name, middle_name, last_name, mob_no, email, 
        //             department_id, office_location_id, taluka_id, village_id, 
        //             cader_id, password, role_id, device_id 
        //         } = req.body;
        
        //         // Validate required fields (email is optional)
        //         if (!first_name || !middle_name || !last_name || !mob_no || 
        //             !department_id || !office_location_id || !taluka_id || !village_id || 
        //             !cader_id || !password || !role_id || !device_id) {
        //             return res.status(400).json({ message: "All required fields must be provided" });
        //         }
        
        //         // Hash the password before storing
        //         const hashedPassword = await bcrypt.hash(password, 8);
        
        //         // Get current timestamp
        //         const createdAt = new Date();
        
        //         // Call the stored procedure
        //         const result = await query(
        //             "CALL RegisterUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        //             [
        //                 first_name, middle_name, last_name, mob_no, email || null, // Store email if provided, otherwise NULL
        //                 department_id, office_location_id, taluka_id, village_id,
        //                 cader_id, hashedPassword, role_id, device_id, createdAt
        //             ]
        //         );
        
        //         // Log result for debugging
        //         console.log(result);
        
        //         // Check if user was inserted successfully
        //         if (result.affectedRows > 0) {
        //             return res.status(201).json({ message: "User registered successfully" });
        //         } else {
        //             return res.status(400).json({ message: "Failed to register user" });
        //         }
        
        //     } catch (err) {
        //         // Handle duplicate email error
        //         if (err.message.includes("Duplicate entry")) {
        //             return res.status(400).json({error: err.message });
        //         }
        //         // Handle other errors
        //         res.status(500).json({ message: "Error registering user", error: err.message });
        //     }
        // }

        register: async (req, res) => {
            try {
                // Check for validation errors
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }
        
                const { 
                    first_name, middle_name, last_name, mob_no, email, 
                    department_id, office_location_id, taluka_id, village_id, 
                    cader_id, password, role_id, device_id 
                } = req.body;
        
                // Validate required fields (email is optional)
                if (!first_name || !middle_name || !last_name || !mob_no || 
                    !department_id || !office_location_id || !taluka_id || !village_id || 
                    !cader_id || !password || !role_id || !device_id) {
                    return res.status(400).json({ message: "All required fields must be provided" });
                }
        
                // Hash the password before storing
                const hashedPassword = await bcrypt.hash(password, 8);
        
                // Get current timestamp
                const createdAt = new Date();
        
                // Call the stored procedure
                const result = await query(
                    "CALL RegisterUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        first_name, middle_name, last_name, mob_no, email || null, // Store email if provided, otherwise NULL
                        department_id, office_location_id, taluka_id, village_id,
                        cader_id, hashedPassword, role_id, device_id, createdAt
                    ]
                );
        
                // Log result for debugging
                console.log(result);
        
                // Check if user was inserted successfully
                if (result.affectedRows > 0) {
                    return res.status(201).json({ message: "User registered successfully" });
                } else {
                    return res.status(400).json({ message: "Failed to register user" });
                }
        
            } catch (err) {
                // Handle duplicate email error
                if (err.message.includes("Duplicate entry")) {
                    return res.status(400).json({error: err.message });
                }
                // Handle other errors
                res.status(500).json({ message: "Error registering user", error: err.message });
            }
        }
        
};


