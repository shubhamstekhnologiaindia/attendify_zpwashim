import { query } from "../../../../utils/database.js";
import { decrypt } from "../../../../utils/crypto.js"; // Import decryption function

export const shiftService = {

  createShift: async (
    shiftName,
    shiftStart,
    shiftEnd,
    morningInStart,
    morningInEnd,
    lateCutOff,
    afternoonInStart,
    afternoonInEnd,
    overtimeAllowedFrom,
    createdBy,
    department_id
  ) => {
    try {
      const sql = 'CALL CreateShift(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const params = [
        shiftName,
        shiftStart,
        shiftEnd,
        morningInStart,
        morningInEnd,
        lateCutOff,
        afternoonInStart,
        afternoonInEnd,
        overtimeAllowedFrom,
        createdBy,
        department_id
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

  /** Get all active shifts */
 getShifts: async () => {
  try {
    const [rows] = await query('CALL GetShifts()');
    return rows;
  } catch (error) {
    throw { status: false, message: 'Error fetching shifts' };
  }
},

  /** Get a shift by ID */
  getShiftById: async (shiftId) => {
    try {
      const [rows] = await query('CALL GetShiftById(?)', [shiftId]);
      return rows[0] || null;
    } catch (error) {
      throw { status: false, message: 'Error fetching shift' };
    }
  },

  /** Update shift details */
  // editShift: async (
  //   edit_shift_id,
  //   shiftName,
  //   shiftStart,
  //   shiftEnd,
  //   morningInStart,
  //   morningInEnd,
  //   lateCutOff,
  //   afternoonInStart,
  //   afternoonInEnd,
  //   overtimeAllowedFrom,
  //   updatedBy,
  //   department_id
  // ) => {
  //   try {
  //     const sql = 'CALL UpdateShift(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  //     const params = [
  //       edit_shift_id,
  //       shiftName,
  //       shiftStart,
  //       shiftEnd,
  //       morningInStart,
  //       morningInEnd,
  //       lateCutOff,
  //       afternoonInStart,
  //       afternoonInEnd,
  //       overtimeAllowedFrom,
  //       updatedBy,
  //       departmentId
  //     ];
  //     const [rows] = await query(sql, params);
  //     return { affected: rows[0]?.affected || 0 };
  //   } catch (error) {
  //     throw { status: false, message: 'Error updating shift' };
  //   }
  // },

  /** Update shift details */
editShift: async (
  edit_shift_id,
  shiftName,
  shiftStart,
  shiftEnd,
  morningInStart,
  morningInEnd,
  lateCutOff,
  afternoonInStart,
  afternoonInEnd,
  overtimeAllowedFrom,
  updatedBy,
  department_id
) => {
console.log( edit_shift_id,
  shiftName,
  shiftStart,
  shiftEnd,
  morningInStart,
  morningInEnd,
  lateCutOff,
  afternoonInStart,
  afternoonInEnd,
  overtimeAllowedFrom,
  updatedBy,
  department_id)

  try {
    const sql = 'CALL UpdateShift(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [
      edit_shift_id,
      shiftName,
      shiftStart,
      shiftEnd,
      morningInStart,
      morningInEnd,
      lateCutOff,
      afternoonInStart,
      afternoonInEnd,
      overtimeAllowedFrom,
      updatedBy,
      department_id
    ];
    const [rows] = await query(sql, params);
    return { affected: rows[0]?.affected || 0 };
  } catch (error) {
    console.error('Error in editShift service:', error);
    throw { status: false, message: 'Error updating shift' };
  }
},


  /** Delete (soft) a shift */
  deleteShift: async (delete_shift_id) => {
    try {
      const [rows] = await query('CALL DeleteShift(?)', [delete_shift_id]);
      return { affected: rows[0]?.affected || 0 };
    } catch (error) {
      throw { status: false, message: 'Error deleting shift' };
    }
  }
 
};
