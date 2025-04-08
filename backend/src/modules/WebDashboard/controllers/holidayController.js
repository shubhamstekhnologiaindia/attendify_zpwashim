import { HolidayService } from "../services/holidayService.js";
import moment from "moment-timezone";

export const HolidayController = {
        showHolidays: async (req, res) => {
            try {
                const holiday = await HolidayService.getUpcomingHoliday();
    
                if (!holiday) {
                    return res.status(200).json({
                        success: true,
                        today: moment().format('YYYY-MM-DD'),
                        message: "No upcoming holiday"
                    });
                }
    
                res.status(200).json({
                    success: true,
                    today: moment().format('YYYY-MM-DD'),
                    upcoming_holiday: holiday
                });
            } catch (error) {
                console.error("Error fetching holidays:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch upcoming holidays"
                });
            }
        }
    };