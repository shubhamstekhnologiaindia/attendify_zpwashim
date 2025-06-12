import { query } from '../../../../utils/database.js'

export const overrideShiftService = {
 createOrrShift: async data => {
  const {
    cader_id,
       department_id,
    override_shift_name,
    shift_start,
  shift_end,
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
        ?,?,? ,?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?,?
      )`;                  
    const params = [
      cader_id,
            department_id ,
      override_shift_name,
      shift_start,
      shift_end,
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

  // getOrrShifts: async () => {
  //   try {
  //     const [rows] = await query('CALL GetOverrideShifts()')
  //     return rows
  //   } catch (error) {
  //     throw { status: false, message: 'Error fetching overrides' }
  //   }
  // },
  
// getOrrShifts: async () => {
//   try {
//     const [rows] = await query('CALL GetOverrideShifts()');
    
//     // Log to inspect structure
//     console.log("rows:", rows);

//     // If `rows` is an array of rows (not a nested array), use it directly
//     const overrideShifts = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;

//     if (!Array.isArray(overrideShifts)) {
//       throw new Error('Expected overrideShifts to be an array');
//     }

//     const formatted = overrideShifts.map((row) => ({
//       ...row,
//       ovrr_start_date: row.ovrr_start_date
//         ? new Date(row.ovrr_start_date).toLocaleDateString('en-CA')
//         : null,
//       ovrr_end_date: row.ovrr_end_date
//         ? new Date(row.ovrr_end_date).toLocaleDateString('en-CA')
//         : null,
//     }));

//     return formatted;
//   } catch (error) {
//     console.log("Error in getOrrShifts:", error);
//     throw { status: false, message: error.message || 'Error fetching overrides' };
//   }
// },

getOrrShifts: async () => {
  try {
    const [rows] = await query('CALL GetOverrideShifts()');

    // If `rows` is an array of arrays (MySQL result format), pick the first set
    const overrideShifts = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;

    if (!Array.isArray(overrideShifts)) {
      throw new Error('Expected overrideShifts to be an array');
    }

    const toISTDateString = (date) => {
      if (!date) return null;
      const istOffsetMs = 5.5 * 60 * 60 * 1000; // 5 hours 30 mins
      const istDate = new Date(new Date(date).getTime() + istOffsetMs);
      return istDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    };

    const formatted = overrideShifts.map((row) => ({
      ...row,
      ovrr_start_date: toISTDateString(row.ovrr_start_date),
      ovrr_end_date: toISTDateString(row.ovrr_end_date),
    }));

    return formatted;
  } catch (error) {
    console.error("Error in getOrrShifts:", error);
    throw { status: false, message: error.message || 'Error fetching overrides' };
  }
},
  // editOrrShift: async (
  //   edit_orrshift_id,
  //   override_shift_name,
  //   shift_start,
  //   shift_end,
  //   start_date,
  //   end_date,
  //   morning_in_start,
  //   morning_in_end,
  //   late_cut_off,
  //   afternoon_in_start,
  //   afternoon_in_end,
  //   overtime_allowed_from,
  //   updated_by,
  //   department_id
  // ) => {
  //   try {
  //     const sql = 'CALL UpdateOverrideShift(?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  //     const params = [
  //       edit_orrshift_id,
  //       override_shift_name,
  //       shift_start,
  //       shift_end,
  //       start_date,
  //       end_date,
  //       morning_in_start,
  //       morning_in_end,
  //       late_cut_off,
  //       afternoon_in_start,
  //       afternoon_in_end,
  //       overtime_allowed_from,
  //       updated_by,
  //       department_id
  //     ]
  //     const [rows] = await query(sql, params)
  //     return { affected: rows[0].affected }
  //   } catch (error) {
  //     throw { status: false, message: 'Error updating override' }
  //   }
  // },
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
    department_id,
     shift_start,
  shift_end
  ) => {
    try {
      const sql = 'CALL UpdateOverrideShift(?,?,? ,?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)'
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
        department_id,
         shift_start,
        shift_end
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
