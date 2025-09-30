const Instruction = require('../models/Instruction');
const { handleDatabaseError } = require('../utils/errorHandler');
const { validateData, generateSampleData } = require('../utils/validation');
const { pool } = require('../config/database');
const openaiService = require('../services/openaiService');

class InstructionController {
  // GET /sap_bp_master_instructions - Get all SAP BP Master Instructions
  static async getAllInstructions(req, res) {
    try {
      const instructions = await Instruction.getAll();
      
      res.status(200).json({
        success: true,
        count: instructions.length,
        data: instructions
      });
    } catch (err) {
      handleDatabaseError(err, res);
    }
  }

  // GET /sap_bp_master_instructions/:sapFieldName - Get single instruction by SAP Field Name
  static async getInstructionBySapFieldName(req, res) {
    try {
      const { sapFieldName } = req.params;
      const instruction = await Instruction.getBySapFieldName(sapFieldName);
      
      if (!instruction) {
        return res.status(404).json({
          success: false,
          message: `Instruction with SAP Field Name '${sapFieldName}' not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: instruction
      });
    } catch (err) {
      handleDatabaseError(err, res);
    }
  }

  // POST /sap_bp_master_instructions - Create new SAP BP Master Instruction
  static async createInstruction(req, res) {
    try {
      const {
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table
      } = req.body;
      
      // Validate required fields
      if (!sap_field_name) {
        return res.status(400).json({
          success: false,
          message: 'sap_field_name is required'
        });
      }
      
      if (!db_field_name) {
        return res.status(400).json({
          success: false,
          message: 'db_field_name is required'
        });
      }
      
      const instruction = await Instruction.create({
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table
      });
      
      res.status(201).json({
        success: true,
        message: 'SAP BP Master Instruction created successfully',
        data: instruction
      });
    } catch (err) {
      if (err.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          success: false,
          message: 'Instruction with this SAP Field Name already exists'
        });
      }
      handleDatabaseError(err, res);
    }
  }

  // PUT /sap_bp_master_instructions/:sapFieldName - Update instruction by SAP Field Name
  static async updateInstruction(req, res) {
    try {
      const { sapFieldName } = req.params;
      const {
        db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table
      } = req.body;
      
      const instruction = await Instruction.updateBySapFieldName(sapFieldName, {
        db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table
      });
      
      if (!instruction) {
        return res.status(404).json({
          success: false,
          message: `Instruction with SAP Field Name '${sapFieldName}' not found`
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'SAP BP Master Instruction updated successfully',
        data: instruction
      });
    } catch (err) {
      handleDatabaseError(err, res);
    }
  }

  // DELETE /sap_bp_master_instructions/:sapFieldName - Delete instruction by SAP Field Name
  static async deleteInstruction(req, res) {
    try {
      const { sapFieldName } = req.params;
      const instruction = await Instruction.deleteBySapFieldName(sapFieldName);
      
      if (!instruction) {
        return res.status(404).json({
          success: false,
          message: `Instruction with SAP Field Name '${sapFieldName}' not found`
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'SAP BP Master Instruction deleted successfully',
        data: instruction
      });
    } catch (err) {
      handleDatabaseError(err, res);
    }
  }

  // GET /instructions/:category - Get validation instructions for a category
  static async getInstructionsByCategory(req, res) {
    try {
      const { category } = req.params;
      
      console.log(`Fetching instructions for category: ${category}`);
      
      const instructions = await Instruction.getByCategory(category);
      
      // Transform data to match expected format
      const fields = instructions.map(row => ({
        sapFile: row.sap_field_name,
        dbField: row.db_field_name,
        description: row.description,
        type: row.data_type,
        length: parseInt(row.field_length) || 0,
        mandatory: row.is_mandatory === 'Y',
        validValues: row.valid_values ? row.valid_values.split(',').map(v => v.trim()) : null,
        relatedTable: row.related_table
      }));
      
      res.status(200).json({
        success: true,
        category: category,
        fields: fields,
        source: 'database'
      });
    } catch (err) {
      console.error(`Error fetching instructions for category ${req.params.category}:`, err);
      
      // Provide specific error message for database connection issues
      if (err.code === 'ECONNREFUSED') {
        res.status(503).json({
          error: 'Database connection failed',
          message: `Cannot connect to database server at ${process.env.DB_HOST || '66.175.209.51'}:${process.env.DB_PORT || 5432}. Please check if PostgreSQL is running and accessible.`,
          details: {
            host: process.env.DB_HOST || '66.175.209.51',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'sapb1validator',
            errorCode: err.code
          }
        });
      } else {
        res.status(500).json({
          error: 'Database error',
          message: err.message,
          details: {
            code: err.code,
            table: req.params.category
          }
        });
      }
    }
  }

  // POST /validate/:category - Validate uploaded Excel file with AI
  static async validateData(req, res) {
    try {
      const { category } = req.params;
      const { data } = req.body; // Excel data will be sent from frontend
      
      // Get validation rules for the category
      const instructions = await Instruction.getByCategory(category);
      
      const validationRules = instructions.map(row => ({
        sapFile: row.sap_field_name,
        dbField: row.db_field_name,
        description: row.description,
        type: row.data_type,
        length: parseInt(row.field_length) || 0,
        mandatory: row.is_mandatory === 'Y',
        validValues: row.valid_values ? row.valid_values.split(',').map(v => v.trim()) : null,
        relatedTable: row.related_table,
        remarks: row.remarks || null
      }));
      
      // Try AI validation first
      const aiValidationResult = await openaiService.validateDataWithAI(data, validationRules, category);
      
      if (aiValidationResult.success) {
        // Use AI validation results
        res.status(200).json({
          success: true,
          category: category,
          summary: aiValidationResult.data.summary,
          results: aiValidationResult.data.results,
          aiRecommendations: aiValidationResult.data.aiRecommendations,
          validationMethod: 'AI'
        });
      } else {
        // Fallback to basic validation
        console.log('AI validation failed, using basic validation:', aiValidationResult.error);
        const validationResult = validateData(data, validationRules);
        
        res.status(200).json({
          success: true,
          category: category,
          summary: validationResult.summary,
          results: validationResult.results,
          validationMethod: 'Basic',
          aiError: aiValidationResult.error
        });
      }
    } catch (err) {
      console.error('Validation error:', err);
      handleDatabaseError(err, res);
    }
  }

  // GET /download-sample/:category - Generate and download sample Excel file
  static async generateSampleData(req, res) {
    try {
      const { category } = req.params;
      
      // Get validation rules
      const instructions = await Instruction.getByCategory(category);
      
      const fields = instructions.map(row => ({
        sapFile: row.sap_field_name,
        dbField: row.db_field_name,
        description: row.description,
        type: row.data_type,
        length: parseInt(row.field_length) || 0,
        mandatory: row.is_mandatory === 'Y',
        validValues: row.valid_values ? row.valid_values.split(',').map(v => v.trim()) : null,
        relatedTable: row.related_table
      }));
      
      // Generate sample data
      const sampleData = generateSampleData(fields);
      
      res.status(200).json({
        success: true,
        category: category,
        headers: fields.map(f => f.sapFile),
        sampleData: sampleData
      });
    } catch (err) {
      handleDatabaseError(err, res);
    }
  }

  // GET /debug/tables - Debug endpoint to check table names
  static async getTableNames(req, res) {
    try {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      const tables = result.rows.map(row => row.table_name);
      
      res.status(200).json({
        success: true,
        tables: tables
      });
    } catch (err) {
      console.error('Error getting table names:', err);
      handleDatabaseError(err, res);
    }
  }

  // GET /debug/table-structure/:tableName - Get table structure
  static async getTableStructure(req, res) {
    try {
      const { tableName } = req.params;
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      res.status(200).json({
        success: true,
        tableName: tableName,
        columns: result.rows
      });
    } catch (err) {
      handleDatabaseError(err, res);
    }
  }

  // GET /instructions/subcategory/:subcategoryName - Get instructions by subcategory name
  static async getInstructionsBySubcategory(req, res) {
    try {
      const { subcategoryName } = req.params;
      
      // Map subcategory names to their respective instruction tables
      const subcategoryTableMap = {
        'General Info': 'sap_bpmaster_instructions',
        'Address': 'sap_bpmaster_instructions', 
        'Tax Info': 'sap_bpmaster_instructions',
        'Contact Person': 'sap_bpmaster_instructions',
        'State Code': 'sap_bpmaster_instructions',
        'Group Code': 'sap_bpmaster_instructions',
        'Item Details': 'item_field_instructions',
        'Pricing': 'item_field_instructions',
        'Inventory': 'item_field_instructions',
        'Categories': 'item_field_instructions',
        'Specifications': 'item_field_instructions'
      };
      
      console.log(`Looking for subcategory: ${subcategoryName}`);
      console.log(`Available mappings:`, Object.keys(subcategoryTableMap));
      
      const tableName = subcategoryTableMap[subcategoryName];
      
      if (!tableName) {
        return res.status(404).json({
          success: false,
          message: `No instruction table found for subcategory: ${subcategoryName}`
        });
      }
      
      let instructions = [];
      
      if (tableName === 'sap_bpmaster_instructions') {
        // For SAP BP Master instructions, get all instructions and format them
        console.log(`Querying table: ${tableName}`);
        
        // First, let's check if the table exists and what columns it has
        const tableCheck = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);
        
        console.log(`Table ${tableName} columns:`, tableCheck.rows);
        
        // Build query based on available columns
        const availableColumns = tableCheck.rows.map(row => row.column_name);
        const selectColumns = [];
        
        if (availableColumns.includes('sap_field_name')) selectColumns.push('sap_field_name');
        if (availableColumns.includes('db_field_name')) selectColumns.push('db_field_name');
        if (availableColumns.includes('description')) selectColumns.push('description');
        if (availableColumns.includes('data_type')) selectColumns.push('data_type');
        if (availableColumns.includes('field_length')) selectColumns.push('field_length');
        if (availableColumns.includes('is_mandatory')) selectColumns.push('is_mandatory');
        if (availableColumns.includes('valid_values')) selectColumns.push('valid_values');
        if (availableColumns.includes('related_table')) selectColumns.push('related_table');
        if (availableColumns.includes('remarks')) selectColumns.push('remarks');
        if (availableColumns.includes('instruction_image_path')) selectColumns.push('instruction_image_path');
        if (availableColumns.includes('table_name')) selectColumns.push('table_name');
        
        console.log(`Selecting columns:`, selectColumns);
        
        const result = await pool.query(`
          SELECT DISTINCT ${selectColumns.join(', ')}
          FROM "${tableName}"
          ORDER BY ${selectColumns[0] || '1'}
        `);
        
        instructions = result.rows.map(row => ({
          sapFile: row.sap_field_name || '',
          dbField: row.db_field_name || '',
          description: row.description || '',
          type: row.data_type || 'String',
          length: parseInt(row.field_length) || 0,
          mandatory: row.is_mandatory === 'Y' || row.is_mandatory === 'true' || false,
          validValues: row.valid_values ? row.valid_values.split(',') : null,
          relatedTable: row.related_table || null,
          remarks: row.remarks || null,
          instructionImagePath: row.instruction_image_path || null,
          tableName: row.table_name || null
        }));
      } else if (tableName === 'item_field_instructions') {
        // For item field instructions, fetch and format data
        const result = await pool.query(`
          SELECT 
            field_name as sap_field_name,
            field_name as db_field_name,
            field_name as description,
            data_type,
            field_length::text as field_length,
            is_mandatory::text as is_mandatory,
            '' as valid_values,
            '' as related_table
          FROM "${tableName}"
          ORDER BY id
        `);
        
        instructions = result.rows.map(row => ({
          sapFile: row.sap_field_name,
          dbField: row.db_field_name,
          description: row.description,
          type: row.data_type,
          length: parseInt(row.field_length) || 0,
          mandatory: row.is_mandatory === 'true' || row.is_mandatory === 'Y',
          validValues: row.valid_values ? row.valid_values.split(',') : null,
          relatedTable: row.related_table || null,
          remarks: null, // This column doesn't exist in the current table
          instructionImagePath: null, // This column doesn't exist in the current table
          tableName: null // This column doesn't exist in the current table
        }));
      }
      
      res.status(200).json({
        success: true,
        category: subcategoryName,
        fields: instructions,
        source: 'database'
      });
      
    } catch (err) {
      console.error('Error in getInstructionsBySubcategory:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        detail: err.detail,
        hint: err.hint
      });
      handleDatabaseError(err, res);
    }
  }

  // POST /instructions/:category - Create new field instruction for a category
  static async createFieldInstructionByCategory(req, res) {
    try {
      const { category } = req.params;
      const {
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table
      } = req.body;
      
      // Validate required fields
      if (!sap_field_name) {
        return res.status(400).json({
          success: false,
          message: 'sap_field_name is required'
        });
      }
      
      if (!db_field_name) {
        return res.status(400).json({
          success: false,
          message: 'db_field_name is required'
        });
      }

      if (!data_type) {
        return res.status(400).json({
          success: false,
          message: 'data_type is required'
        });
      }

      if (!field_length) {
        return res.status(400).json({
          success: false,
          message: 'field_length is required'
        });
      }
      
      const instruction = await Instruction.createByCategory(category, {
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table
      });
      
      res.status(201).json({
        success: true,
        message: 'Field instruction created successfully',
        data: instruction
      });
    } catch (err) {
      if (err.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          success: false,
          message: 'Instruction with this SAP Field Name already exists'
        });
      }
      handleDatabaseError(err, res);
    }
  }

  // GET /instructions/dynamic/:subcategoryName - Get field instructions from Data_Table
  static async getDynamicFieldInstructions(req, res) {
    try {
      const { subcategoryName } = req.params;
      
      console.log(`Fetching dynamic field instructions for subcategory: ${subcategoryName}`);
      
      // First, get the Data_Table for this subcategory
      const subcategoryQuery = `
        SELECT "Data_Table" 
        FROM "SAP_SubCategories" 
        WHERE "SubCategoryName" = $1
      `;
      
      const subcategoryResult = await pool.query(subcategoryQuery, [subcategoryName]);
      
      if (subcategoryResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Subcategory '${subcategoryName}' not found`
        });
      }

      const dataTable = subcategoryResult.rows[0].Data_Table;
      
      if (!dataTable) {
        return res.status(400).json({
          success: false,
          message: `No Data_Table configured for subcategory '${subcategoryName}'`
        });
      }

      console.log(`Data_Table for ${subcategoryName}: ${dataTable}`);

      // Check if the table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      
      const tableExistsResult = await pool.query(tableExistsQuery, [dataTable]);
      
      if (!tableExistsResult.rows[0].exists) {
        return res.status(400).json({
          success: false,
          message: `Data table '${dataTable}' does not exist`
        });
      }

      // Get table structure to understand the columns
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const columnsResult = await pool.query(columnsQuery, [dataTable]);
      const columns = columnsResult.rows.map(col => col.column_name);

      console.log(`Table ${dataTable} columns:`, columns);

      // First, let's check if this is a field instructions table or a data table
      // by looking for common field instruction column patterns
      const instructionColumns = columns.filter(col => 
        col.toLowerCase().includes('sap_field') || 
        col.toLowerCase().includes('field_name') || 
        col.toLowerCase().includes('description') ||
        col.toLowerCase().includes('data_type') ||
        col.toLowerCase().includes('mandatory')
      );

      let fields = [];

      if (instructionColumns.length > 0) {
        // This appears to be a field instructions table
        console.log(`Table ${dataTable} appears to be a field instructions table`);
        const dataQuery = `SELECT * FROM "${dataTable}" ORDER BY 1 LIMIT 1000`;
        const dataResult = await pool.query(dataQuery);

        fields = dataResult.rows.map((row, index) => {
          console.log(`Processing instruction row ${index + 1}:`, row);
          
          const field = {
            sapFile: row['SAP Files'] || row.sap_field_name || row.field_name || row.name || `Field_${index + 1}`,
            dbField: row['Data Base Field'] || row.db_field_name || row.field_name || row.name || `field_${index + 1}`,
            description: row.Description || row.description || row.desc || row.comment || '',
            type: row['Data Type'] || row.data_type || row.type || 'String',
            length: parseInt(row['Field Length'] || row.field_length || row.length || row.max_length || 0) || 0,
            mandatory: row.Mandatory === true || row.Mandatory === 'Y' || row.is_mandatory === 'Y' || row.is_mandatory === true || row.required === true || false,
            validValues: row['Valid Values'] ? (Array.isArray(row['Valid Values']) ? row['Valid Values'] : row['Valid Values'].split(',')) : (row.valid_values ? (Array.isArray(row.valid_values) ? row.valid_values : row.valid_values.split(',')) : null),
            relatedTable: row['Related Table'] || row.related_table || row.table_name || dataTable || null,
            remarks: row.Remarks || row.remarks || row.note || row.comment || null,
            instructionImagePath: row['Instruction Image path'] || row.instruction_image_path || row.image_path || null,
            tableName: dataTable
          };

          return field;
        });
      } else {
        // This appears to be a data table, so we'll create field instructions from the table structure
        console.log(`Table ${dataTable} appears to be a data table, creating field instructions from structure`);
        
        fields = columns.map((column, index) => {
          const columnInfo = columnsResult.rows.find(col => col.column_name === column);
          
          const field = {
            sapFile: column,
            dbField: column,
            description: `Field for ${column}`,
            type: columnInfo?.data_type || 'String',
            length: parseInt(columnInfo?.character_maximum_length || 0) || 0,
            mandatory: columnInfo?.is_nullable === 'NO' || false,
            validValues: null,
            relatedTable: dataTable,
            remarks: `Column from ${dataTable} table`,
            instructionImagePath: null,
            tableName: dataTable
          };

          return field;
        });
      }

      res.status(200).json({
        success: true,
        category: subcategoryName,
        dataTable: dataTable,
        fields: fields,
        source: 'dynamic_table',
        totalRecords: fields.length
      });
      
    } catch (err) {
      console.error('Error in getDynamicFieldInstructions:', err);
      handleDatabaseError(err, res);
    }
  }
}

module.exports = InstructionController;
