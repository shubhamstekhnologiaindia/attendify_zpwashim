import { overrideShiftService } from '../services/orrShiftService.js';

export const OverrideShiftController = {
createOrrShift: async (req, res) => {
  try {
    const data = req.body;
    const result = await overrideShiftService.createOrrShift(data);
    
    if (result.status === false) {
      return res
        .status(400)
        .json({ status: false, data: {}, message: result.message });
    }
    return res
      .status(201)
      .json({
        status: true,
        data: { override_shift_id: result.override_shift_id },
        message: 'Override created'
      });
  } catch (error) {

    const statusCode = error.status === false ? 400 : 500;
    return res
      .status(statusCode)
      .json({ status: false, data: {}, message: error.message });
  }
},

  getOrrShifts: async (req, res) => {
    try {
      const overrides = await overrideShiftService.getOrrShifts()
      return res.status(200).json({ status: true, data: overrides });
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  },

//   getById: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const override = await overrideShiftService.getById(Number(id));
//       if (!override) return res.status(404).json({ status: false, message: 'Not found' });
//       return res.status(200).json({ status: true, data: override });
//     } catch (error) {
//       return res.status(500).json({ status: false, message: error.message });
//     }
//   },

  editOrrShift: async (req, res) => {
    try {
      const { edit_orrshift_id } = req.params;
      const {override_shift_name,start_date, end_date,  morning_in_start, morning_in_end,late_cut_off,afternoon_in_start,afternoon_in_end,overtime_allowed_from,updated_by,department_id}= req.body

      const result = await overrideShiftService.editOrrShift(
        Number(edit_orrshift_id),
        override_shift_name,
        start_date,
        end_date,
        morning_in_start,
        morning_in_end,
        late_cut_off,
        afternoon_in_start,
        afternoon_in_end,
        overtime_allowed_from,
        updated_by,
        department_id
      );

      return res.status(200).json({ status: true, data: result, message: 'Override updated' });
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message })
    }
  },
  deleteOrrShift: async (req, res) =>{
    try {
      const { delete_orrshift_id } = req.query
      const result = await overrideShiftService.deleteOrrShift(Number(delete_orrshift_id));
      return res.status(200).json({ status: true, data: result, message: 'Override deleted' })
    } catch (error) {
      return res.status(500).json({ status: false, message:error.message })
    }
  },
};

