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
     createHoliday: async (req, res) => {
    try {
      const { holiday_name_mr, holiday_name_eng, holiday_date } = req.body;
      await HolidayService.createHoliday({ holiday_name_mr, holiday_name_eng, holiday_date });

      res.status(201).json({ success: true, message: 'Holiday created successfully' });
    } catch (error) {
      console.error("Create error:", error);
      res.status(500).json({ success: false, message: "Failed to create holiday" });
    }
  },
  updateHoliday: async (req, res) => {
  try {
    const id = req.query.id;
    const { holiday_name_mr, holiday_name_eng, holiday_date } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Holiday ID is required in query" });
    }

    await HolidayService.updateHoliday(id, { holiday_name_mr, holiday_name_eng, holiday_date });

    res.status(200).json({ success: true, message: 'Holiday updated successfully' });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Failed to update holiday" });
  }
},

deleteHoliday: async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Holiday ID is required in query" });
    }

    await HolidayService.deleteHoliday(id);

    res.status(200).json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Failed to delete holiday" });
  }
},

showHolidaysList: async (req, res) => {
  try {
    const holidays = await HolidayService.showHolidaysList();

    res.status(200).json({
      success: true,
      total: holidays.length,
      holidays
    });
  } catch (error) {
    console.error("Error fetching holiday list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch holiday list"
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
