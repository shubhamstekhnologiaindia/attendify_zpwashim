import { HolidayService } from "../services/holidayService.js";
import moment from "moment-timezone";

export const HolidayController = {
    showHolidays: async (req, res) => {
        try {
            const [holiday, radius] = await Promise.all([
                HolidayService.getUpcomingHoliday(),
                HolidayService.getRadius()
            ]);

            const today = moment().format('YYYY-MM-DD');

            if (!holiday) {
                return res.status(200).json({
                    success: true,
                    radius: radius || 0,
                    today,
                    message: "No upcoming holiday"
                });
            }

            res.status(200).json({
                success: true,
                radius: radius || 0,
                today,
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
