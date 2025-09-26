const { pool } = require('../config/database');

class Instruction {
  // Get all SAP BP Master Instructions
  static async getAll() {
    const result = await pool.query(`
      SELECT DISTINCT
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table
      FROM "sap_bpmaster_instructions"
      ORDER BY sap_field_name
    `);
    return result.rows;
  }

  // Get single instruction by SAP Field Name
  static async getBySapFieldName(sapFieldName) {
    const result = await pool.query(`
      SELECT 
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table
      FROM "sap_bpmaster_instructions" 
      WHERE sap_field_name = $1
    `, [sapFieldName]);
    return result.rows[0];
  }

  // Create new SAP BP Master Instruction
  static async create(instructionData) {
    const {
      sap_field_name, db_field_name, description, data_type, 
      field_length, is_mandatory, valid_values, related_table
    } = instructionData;
    
    const result = await pool.query(`
      INSERT INTO "sap_bpmaster_instructions" (
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      ) RETURNING *
    `, [
      sap_field_name, db_field_name, description, data_type, 
      field_length, is_mandatory, valid_values, related_table
    ]);
    return result.rows[0];
  }

  // Update instruction by SAP Field Name
  static async updateBySapFieldName(sapFieldName, instructionData) {
    const {
      db_field_name, description, data_type, 
      field_length, is_mandatory, valid_values, related_table
    } = instructionData;
    
    const result = await pool.query(`
      UPDATE "sap_bpmaster_instructions" SET 
        db_field_name = $2, description = $3, data_type = $4, 
        field_length = $5, is_mandatory = $6, valid_values = $7, related_table = $8
      WHERE sap_field_name = $1
      RETURNING *
    `, [
      sapFieldName, db_field_name, description, data_type, 
      field_length, is_mandatory, valid_values, related_table
    ]);
    return result.rows[0];
  }

  // Delete instruction by SAP Field Name
  static async deleteBySapFieldName(sapFieldName) {
    const result = await pool.query(`
      DELETE FROM "sap_bpmaster_instructions" 
      WHERE sap_field_name = $1
      RETURNING *
    `, [sapFieldName]);
    return result.rows[0];
  }

  // Get instructions by category
  static async getByCategory(category) {
    const categoryMap = {
      'BusinessPartnerMasterData': 'sap_bpmaster_instructions',
      'ItemMasterData': 'item_field_instructions',
      'FinancialData': 'sap_bpmaster_instructions',
      'SetupData': 'sap_bpmaster_instructions'
    };
    
    const tableName = categoryMap[category] || 'sap_bpmaster_instructions';
    
    let result;
    if (category === 'ItemMasterData') {
      // Use different column names for Item_field_instructions table
      result = await pool.query(`
        SELECT DISTINCT
          field_name as sap_field_name,
          field_name as db_field_name,
          '' as description,
          data_type, 
          field_length, 
          is_mandatory, 
          '' as valid_values, 
          '' as related_table
        FROM "${tableName}"
        ORDER BY field_name
      `);
    } else {
      // Use standard column names for other tables
      result = await pool.query(`
        SELECT DISTINCT
          sap_field_name, db_field_name, description, data_type, 
          field_length, is_mandatory, valid_values, related_table
        FROM "${tableName}"
        ORDER BY sap_field_name
      `);
    }
    
    return result.rows;
  }

  // Get available table names for debugging
  static async getTableNames() {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name ILIKE '%item%' OR table_name ILIKE '%instruction%')
      ORDER BY table_name
    `);
    return result.rows.map(row => row.table_name);
  }

  // Create instruction by category
  static async createByCategory(category, instructionData) {
    const {
      sap_field_name, db_field_name, description, data_type, 
      field_length, is_mandatory, valid_values, related_table
    } = instructionData;
    
    const categoryMap = {
      'BusinessPartnerMasterData': 'sap_bpmaster_instructions',
      'ItemMasterData': 'item_field_instructions',
      'FinancialData': 'sap_bpmaster_instructions',
      'SetupData': 'sap_bpmaster_instructions'
    };
    
    const tableName = categoryMap[category] || 'sap_bpmaster_instructions';
    
    let result;
    if (category === 'ItemMasterData') {
      // Use different column names for Item_field_instructions table
      result = await pool.query(`
        INSERT INTO "${tableName}" (
          field_name, data_type, field_length, is_mandatory
        ) VALUES (
          $1, $2, $3, $4
        ) RETURNING *
      `, [
        sap_field_name, data_type, field_length, is_mandatory ? 'Y' : 'N'
      ]);
    } else {
      // Use standard column names for other tables
      result = await pool.query(`
        INSERT INTO "${tableName}" (
          sap_field_name, db_field_name, description, data_type, 
          field_length, is_mandatory, valid_values, related_table
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        ) RETURNING *
      `, [
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory ? 'Y' : 'N', valid_values, related_table
      ]);
    }
    
    return result.rows[0];
  }
}

module.exports = Instruction;
