import { query } from '../../../../utils/database.js'

export const overrideShiftService = {
 createOrrShift: async data => {
  const {
    cader_id,
       department_id,
    override_shift_name,
    start_date,
    end_date,
    morning_in_start,
    morning_in_end,
    late_cut_off,
    afternoon_in_start,
    afternoon_in_end,
    overtime_allowed_from,
    created_by,
 
  } = data;    
  


  try {
    const sql = `
      CALL CreateOverrideShift(
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?,?
      )`;                  
    const params = [
      cader_id,
            department_id ,
      override_shift_name,
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
   const [rows] = await query(sql, params);
    const first = rows[0] || {};

    // If SP returned an overlap message, treat it as an error:
    if (first.message) {
      return {
        status: false,
        data: {},
        message: first.message
      };
    }

    // Otherwise success:
    return {
      status: true,
      data: { override_shift_id: first.override_shift_id },
      message: 'Override created'
    };
  } catch (error) {
    throw {
      status: false,
      message: error.sqlMessage || 'Error creating override'
    };
  }
},

  getOrrShifts: async () => {
    try {
      const [rows] = await query('CALL GetOverrideShifts()')
      return rows
    } catch (error) {
      throw { status: false, message: 'Error fetching overrides' }
    }
  },

  editOrrShift: async (
    edit_orrshift_id,
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
  ) => {
    try {
      const sql = 'CALL UpdateOverrideShift(?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      const params = [
        edit_orrshift_id,
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
      ]
      const [rows] = await query(sql, params)
      return { affected: rows[0].affected }
    } catch (error) {
      throw { status: false, message: 'Error updating override' }
    }
  },

  deleteOrrShift: async delete_orrshift_id => {
    try {
      const sql = 'CALL DeleteOverrideShift(?)'
      const [rows] = await query(sql, [delete_orrshift_id])
      return { affected: rows[0].affected }
    } catch (error) {
      throw { status: false, message: 'Error deleting override' }
    }
  }
}
