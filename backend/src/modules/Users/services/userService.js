import { query } from "../../../../utils/database.js"; 

import moment from "moment-timezone";
export const UserService = {

    getProfile: async (req,res)=>{
        try {
            const userId = req.user.id;
            const sql = `SELECT * FROM users WHERE id = ?`;
            const result = await query(sql, [userId]);
            if(result.length > 0){
                res.status(200).json(result[0]);
            }else{
                res.status(404).json({message: 'User not found'});
            }
        } catch (error) {
            console.error("�� Error in UserService.getProfile:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }


}