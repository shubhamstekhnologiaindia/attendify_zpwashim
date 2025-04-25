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
    },

    updateRadius: async (req, res) => {
        try {
            const { id, radius } = req.body;

            // Validate inputs
            if (!id || !Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "ID must be a positive integer"
                });
            }
            if (!radius || !Number.isInteger(radius) || radius <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Radius must be a positive integer"
                });
            }

            const result = await HolidayService.updateRadius(id, radius);
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
                details: error.message
            });
        }
    },

    getRadiusWeb: async (req, res) => {
        try {
            const result = await HolidayService.getRadiusWeb();
    
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
                details: error.message
            });
        }
    },
};
