import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import dotenv from "dotenv";


import {query} from "../../../../utils/database.js";

dotenv.config();


// export const userController = {
   

//     login: async (req, res) => {
//     try {
//         const { mob_no, password } = req.body;

//         // Check if user exists
//         const users = await query("SELECT * FROM users WHERE mob_no = ?", [mob_no]);

//         if (users.length === 0) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         const user = users[0];

//         // Check password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: "Invalid credentials" });
//         }

//         // Generate JWT Token
//         const token = jwt.sign(
//             { id: user.id, mob_no: user.mob_no },
//             process.env.JWT_SECRET,
//             { expiresIn: "1h" }
//         );

//         res.json({ message: "Login successful", token, user });
//     } catch (err) {
//         res.status(500).json({ message: "Error logging in", error: err.message });
//     }
//     },
// };

export const userController = {
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

            // Generate JWT Token
            // const token = jwt.sign(
            //     { id: user.id, mob_no: user.mob_no },
            //     process.env.JWT_SECRET,
            //     { expiresIn: "1h" }
            // );

            const token = jwt.sign(
                { id: user.id, mob_no: user.mob_no },
                process.env.JWT_SECRET,
                { algorithm: "HS256", expiresIn: "1h" }
            );
            

            res.json({ message: "Login successful", token, user });
        } catch (err) {
            res.status(500).json({ message: "Error logging in", error: err.message });
        }
    }
};

