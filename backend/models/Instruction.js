const { pool } = require('../config/database');

class Instruction {
  // Get all instructions
  static async getAll() {
    const result = await pool.query(`
      SELECT 
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table, 
        remarks, instruction_image_path, table_name
      FROM sap_bp_master_instructions 
      ORDER BY sap_field_name
    `);
    return result.rows;
  }

  // Get instruction by SAP field name
  static async getBySapFieldName(sapFieldName) {
    const result = await pool.query(`
      SELECT 
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table, 
        remarks, instruction_image_path, table_name
      FROM sap_bp_master_instructions 
      WHERE sap_field_name = $1
    `, [sapFieldName]);
    return result.rows[0];
  }

  // Create new instruction
  static async create(data) {
    const {
      sap_field_name, db_field_name, description, data_type, 
      field_length, is_mandatory, valid_values, related_table
    } = data;

    const result = await pool.query(`
      INSERT INTO sap_bp_master_instructions 
      (sap_field_name, db_field_name, description, data_type, field_length, is_mandatory, valid_values, related_table)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [sap_field_name, db_field_name, description, data_type, field_length, is_mandatory, valid_values, related_table]);

    return result.rows[0];
  }

  // Update instruction by SAP field name
  static async updateBySapFieldName(sapFieldName, data) {
    const {
      db_field_name, description, data_type, 
      field_length, is_mandatory, valid_values, related_table
    } = data;

    const result = await pool.query(`
      UPDATE sap_bp_master_instructions 
      SET db_field_name = $1, description = $2, data_type = $3, 
          field_length = $4, is_mandatory = $5, valid_values = $6, related_table = $7
      WHERE sap_field_name = $8
      RETURNING *
    `, [db_field_name, description, data_type, field_length, is_mandatory, valid_values, related_table, sapFieldName]);

    return result.rows[0];
  }

  // Delete instruction by SAP field name
  static async deleteBySapFieldName(sapFieldName) {
    const result = await pool.query(`
      DELETE FROM sap_bp_master_instructions 
      WHERE sap_field_name = $1
      RETURNING *
    `, [sapFieldName]);

    return result.rows[0];
  }

  // Get instructions by category (generic method)
  static async getByCategory(category) {
    // This is a generic method that can be overridden for specific categories
    // For now, return all instructions from the main table
    const result = await pool.query(`
      SELECT 
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table, 
        remarks, instruction_image_path, table_name
      FROM sap_bp_master_instructions 
      ORDER BY sap_field_name
    `);
    return result.rows;
  }

  // Create instruction by category (generic method)
  static async createByCategory(category, data) {
    // This is a generic method that can be overridden for specific categories
    // For now, create in the main table
    return await this.create(data);
  }
}

module.exports = Instruction;
