import moment from "moment-timezone";
import { ForgotPasswordService } from "../services/forgotPasswordService.js";
import { getEpochTime } from "../../../../utils/epochTime.js";
import axios from "axios";


export const ForgotPasswordController = {
    forgotPassword :async (req, res) => {
        try {
            const { mob_no, newPassword } = req.body;
        
            if (!mob_no || !newPassword) {
              return res.status(400).json({ message: 'Mobile number and new password are required' });
            }
        
            const result = await ForgotPasswordService.resetPasswordByMobile(mob_no, newPassword);
        
            if (result.success) {
              return res.status(200).json({ message: 'Password updated successfully' });
            } else {
              return res.status(404).json({ message: result.message });
            }
          } catch (error) {
            console.error('Forgot Password Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
          }
}
};
