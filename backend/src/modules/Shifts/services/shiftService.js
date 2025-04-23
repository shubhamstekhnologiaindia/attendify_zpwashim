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
    departmentId
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
        departmentId
      ];
      const [result] = await query(sql, params);
      const shiftId = result[0]?.shift_id;
      return { shiftId };
    } catch (error) {
      throw { status: false, message: error.sqlMessage || 'Error creating shift' };
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
    updatedBy
  ) => {
    try {
      const sql = 'CALL UpdateShift(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
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
        updatedBy
      ];
      const [rows] = await query(sql, params);
      return { affected: rows[0]?.affected || 0 };
    } catch (error) {
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
