import { shiftService } from "../services/shiftService.js";

export const shiftController = {
  

  createShift: async (req, res) => {
    try {
      const {
        shift_name,
        shift_start,
        shift_end,
        morning_in_start,
        morning_in_end,
        late_cut_Off,
        afternoon_in_start,
        afternoon_in_end,
        overtime_allowed_from,
        created_by,
        department_id
      } = req.body;

      // Validate required fields
      const missing = [];
      if (!shift_name) missing.push('shift_name');
      if (!shift_start) missing.push('shift_start');
      if (!shift_end) missing.push('shift_end');
      if (!morning_in_start) missing.push('morning_in_start');
      if (!morning_in_end) missing.push('morning_in_end');
      if (!late_cut_Off) missing.push('late_cut_Off');
      if (!afternoon_in_start) missing.push('afternoon_in_start');
      if (!afternoon_in_end) missing.push('afternoon_in_end');
      if (!overtime_allowed_from) missing.push('overtime_allowed_from');
      if (!created_by) missing.push('created_by');
      if (!department_id) missing.push('department_id');

      if (missing.length) {
        return res.status(400).json({ status: false, message: `Missing fields: ${missing.join(', ')}` });
      }

      const result = await shiftService.createShift(
        shift_name,
        shift_start,
        shift_end,
        morning_in_start,
        morning_in_end,
        late_cut_Off,
        afternoon_in_start,
        afternoon_in_end,
        overtime_allowed_from,
        created_by,
        department_id
      );
      return res.status(201).json({ status: true, data: result, message: 'Shift created' });
    } catch (error) {
      const statusCode = error.status === false ? 400 : 500;
      return res.status(statusCode).json({ status: false, message: error.message });
    }
  },

  getShifts: async (req, res) => {
    try {
      const shifts = await shiftService.getShifts();
      return res.status(200).json({ status: true, data: shifts });
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  },



  /** Update shift */
  editShift: async (req, res) => {
    try {
      const { edit_shift_id } = req.params;
      const {
        shift_name,
        shift_start,
        shift_end,
        morning_in_start,
        morning_in_end,
        late_cut_Off,
        afternoon_in_start,
        afternoon_in_end,
        overtime_allowed_from,
        updated_by
      } = req.body;

      const result = await shiftService.editShift(
        Number(edit_shift_id),
        shift_name,
        shift_start,
        shift_end,
        morning_in_start,
        morning_in_end,
        late_cut_Off,
        afternoon_in_start,
        afternoon_in_end,
        overtime_allowed_from,
        updated_by
      );
      return res.status(200).json({ status: true, data: result, message: 'Shift updated' });
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  },

  /** Delete shift */
  deleteShift: async (req, res) => {
    try {
      const { delete_shift_id } = req.params;
      const result = await shiftService.deleteShift(Number(delete_shift_id));
      return res.status(200).json({ status: true, data: result, message: 'Shift deleted' });
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  }

};
