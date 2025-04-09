import { BirthdayService } from "../services/birthdayService.js";
import moment from "moment-timezone";
 
export const BirthdayController = {
    showTodaysBirthdays: async (req, res) => {
        try {
            const birthdays = await BirthdayService.getTodaysBirthdays();
 
            if (!birthdays.length) {
                return res.status(200).json({
                    success: true,
                    today: moment().format("YYYY-MM-DD"),
                    message: "No birthdays today",
                    data: []
                });
            }
 
            res.status(200).json({
                success: true,
                today: moment().format("YYYY-MM-DD"),
                birthdays
            });
 
        } catch (error) {
            console.error("Error fetching today's birthdays:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch birthdays"
            });
        }
    }
};
