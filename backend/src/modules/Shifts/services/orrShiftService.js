import { query } from "../../../../utils/database.js";

export const overrideShiftService = {
    createOrrShift: async (data) => {
    const {
      cader_id,
      department_id,
      start_date,
      end_date,
      morning_in_start,
      morning_in_end,
      late_cut_off,
      afternoon_in_start,
      afternoon_in_end,
      overtime_allowed_from,
      created_by
    } = data;
    try {
      const sql = 'CALL CreateOverrideShift(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const params = [
        cader_id,
        department_id,
        start_date,
        end_date,
        morning_in_start,
        morning_in_end,
        late_cut_off,
        afternoon_in_start,
        afternoon_in_end,
        overtime_allowed_from,
        created_by
      ];
      const [result] = await query(sql, params);
      return { override_shift_id: result[0].override_shift_id };
    } catch (error) {
      throw { status: false, message: error.sqlMessage || 'Error creating override' };
    }
  },

  getOrrShifts: async () => {
    try {
      const [rows] = await query('CALL GetOverrideShifts()');
      return rows;
    } catch (error) {
      throw { status: false, message: 'Error fetching overrides' };
    }
  },

//   getById: async (id) => {
//     try {
//       const [rows] = await query('CALL GetOverrideById(?)', [id]);
//       return rows[0] || null;
//     } catch (error) {
//       throw { status: false, message: 'Error fetching override' };
//     }
//   },

editOrrShift: async (edit_orrshift_id,  start_date,  end_date,morning_in_start,morning_in_end,late_cut_off,afternoon_in_start,afternoon_in_end,overtime_allowed_from,updated_by) => {
    try {
      const sql = 'CALL UpdateOverrideShift(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const params = [
        edit_orrshift_id,
        start_date,
        end_date,
        morning_in_start,
        morning_in_end,
        late_cut_off,
        afternoon_in_start,
        afternoon_in_end,
        overtime_allowed_from,
        updated_by
      ];
      const [rows] = await query(sql, params);
      return { affected: rows[0].affected };
    } catch (error) {
      throw { status: false, message: 'Error updating override' };
    }
  },

  deleteOrrShift: async (delete_orrshift_id, department_id, cader_id) => {
    try {
      const sql = 'CALL DeleteOverrideShift(?, ?, ?)';
      const [rows] = await query(sql, [delete_orrshift_id, department_id, cader_id]);
      return { affected: rows[0].affected };
    } catch (error) {
      throw { status: false, message: 'Error deleting override' };
    }
  }
};