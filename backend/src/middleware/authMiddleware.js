import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { query } from "../../utils/database.js";

dotenv.config();

// export const authMiddleware = (req, res, next) => {
//     let token = req.header("Authorization");
//     if (!token) return res.status(401).json({ message: "Access Denied" });

//     if (token.startsWith("Bearer ")) {
//         token = token.slice(7);
//     }

//     try {
//         const verified = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = verified;
//         next();

//     } catch (err) {
//         res.status(401).json({ message: "Invalid Token" });
//     }
// };

export const authMiddleware = async (req, res, next) => {
    let token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    if (token.startsWith("Bearer ")) {
        token = token.slice(7);
    }

    try {
        // Verify JWT token
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Assuming your JWT payload contains a user id as verified.userId (adjust if different)
        const userId = verified.userId || verified.id;

        if (!userId) {
            return res.status(401).json({ message: "Invalid Token: No user id" });
        }


        // Query user from DB and check status
        const users = await query("SELECT * FROM users WHERE id = ? AND status = 1", [userId]);

        if (users.length === 0) {
            return res.status(401).json({ message: "Unauthorized: User inactive or not found" });
        }

        // Attach user info to request object
        req.user = users[0];

        next();
    } catch (err) {

        res.status(401).json({ message: "Invalid Token" });
    }
};