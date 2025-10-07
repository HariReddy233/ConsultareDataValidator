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

  // Get instructions by category (generic method) - Now uses Data_Table from SAP_SubCategories
  static async getByCategory(category) {
    try {
      // Get all Data_Table values for the given category from SAP_SubCategories
      const subcategoryResult = await pool.query(`
        SELECT DISTINCT "Data_Table" 
        FROM "SAP_SubCategories" sc
        JOIN "SAP_MainCategories" mc ON sc."MainCategoryID" = mc."MainCategoryID"
        WHERE mc."MainCategoryName" = $1
      `, [category]);
      
      if (subcategoryResult.rows.length === 0) {
        // If no subcategories found, return all instructions as fallback
        const result = await pool.query(`
          SELECT 
            sap_field_name, db_field_name, description, data_type, 
            field_length, is_mandatory, valid_values, related_table, 
            remarks, instruction_image_path, table_name
          FROM sap_bpmaster_instructions 
          ORDER BY table_name, sap_field_name
        `);
        return result.rows;
      }
      
      const dataTables = subcategoryResult.rows.map(row => row.Data_Table);
      console.log(`Found Data_Tables for category ${category}:`, dataTables);
      
      let allFields = [];
      
      // Fetch data from each individual table
      for (const dataTable of dataTables) {
        try {
          // Check if the data table exists
          const tableExistsQuery = `
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = $1
            );
          `;
          
          const tableExistsResult = await pool.query(tableExistsQuery, [dataTable]);
          
          if (!tableExistsResult.rows[0].exists) {
            console.log(`Table ${dataTable} does not exist, skipping...`);
            continue;
          }
          
          // Get column information for the table
          const columnsQuery = `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = $1 
            AND table_schema = 'public'
            ORDER BY ordinal_position
          `;
          
          const columnsResult = await pool.query(columnsQuery, [dataTable]);
          const columns = columnsResult.rows.map(col => col.column_name);
          
          // Check if this table has the expected instruction columns
          const hasInstructionColumns = columns.some(col => 
            ['SAPFields', 'DataBaseField', 'Description', 'DataType', 'FieldLength', 'Mandatory'].includes(col)
          );
          
          if (hasInstructionColumns) {
            // Fetch data directly from the data table
            const result = await pool.query(`
              SELECT 
                "SAPFields" as sap_field_name,
                "DataBaseField" as db_field_name,
                "Description" as description,
                "DataType" as data_type,
                "FieldLength" as field_length,
                "Mandatory" as is_mandatory,
                "ValidValues" as valid_values,
                "RelatedTable" as related_table,
                "Remarks" as remarks,
                "InstructionImagepath" as instruction_image_path,
                $1 as table_name
              FROM "${dataTable}"
              ORDER BY "SAPFields"
            `, [dataTable]);
            
            allFields = allFields.concat(result.rows);
            console.log(`Found ${result.rows.length} instructions from ${dataTable} table`);
          } else {
            // Fallback to sap_bpmaster_instructions table
            const result = await pool.query(`
              SELECT 
                sap_field_name, db_field_name, description, data_type, 
                field_length, is_mandatory, valid_values, related_table, 
                remarks, instruction_image_path, table_name
              FROM sap_bpmaster_instructions 
              WHERE table_name = $1
              ORDER BY sap_field_name
            `, [dataTable]);
            
            allFields = allFields.concat(result.rows);
            console.log(`Found ${result.rows.length} instructions from sap_bpmaster_instructions for ${dataTable}`);
          }
        } catch (tableError) {
          console.error(`Error fetching data from ${dataTable}:`, tableError.message);
          // Continue with other tables
        }
      }
      
      return allFields;
    } catch (error) {
      console.error('Error in getByCategory:', error);
      // Fallback to returning all instructions if there's an error
      const result = await pool.query(`
        SELECT 
          sap_field_name, db_field_name, description, data_type, 
          field_length, is_mandatory, valid_values, related_table, 
          remarks, instruction_image_path, table_name
        FROM sap_bpmaster_instructions 
        ORDER BY table_name, sap_field_name
      `);
      return result.rows;
    }
  }

  // Create instruction by category (generic method)
  static async createByCategory(category, data) {
    // This is a generic method that can be overridden for specific categories
    // For now, create in the main table
    return await this.create(data);
  }
}

module.exports = Instruction;
