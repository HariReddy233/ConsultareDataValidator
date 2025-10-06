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
      
      // Completely dynamic field mapping
      const fields = instructions.map(row => {
        const field = {};
        Object.keys(row).forEach(key => {
          field[key] = row[key];
        });
        return field;
      });
      
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
      
      console.log(`Validating data for category: ${category}`);
      console.log(`Data received:`, data);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data provided for validation'
        });
      }

      // Get field instructions for the category to use as validation rules
      let validationRules = [];
      try {
        const instructionsResponse = await this.getInstructionsByCategoryInternal(category);
        if (instructionsResponse.success && instructionsResponse.fields) {
          validationRules = instructionsResponse.fields;
        }
      } catch (err) {
        console.warn('Could not fetch validation rules:', err.message);
      }

      // Use AI validation with proper field instructions
      let validationResult;
      let aiError = null;
      
      try {
        console.log('Attempting AI validation with field instructions...');
        const aiResponse = await openaiService.validateDataWithAI(data, validationRules, category);
        
        if (aiResponse.success) {
          validationResult = aiResponse.data;
          console.log('AI validation completed successfully');
          
          // Check if there's a warning about parsing
          if (aiResponse.warning) {
            console.warn('AI validation warning:', aiResponse.warning);
          }
        } else {
          throw new Error(aiResponse.error || 'AI validation failed');
        }
      } catch (aiErr) {
        console.warn('AI validation failed, falling back to field-based validation:', aiErr.message);
        aiError = aiErr.message;
        
        // Fallback to field-based validation
        const results = [];
        let validCount = 0;
        let warningCount = 0;
        let errorCount = 0;
        
        data.forEach((row, index) => {
          const rowErrors = [];
          const rowWarnings = [];
          const fieldsWithIssues = [];
          
          // Get the primary key field for this row
          const primaryKey = row.CardCode || row.ItemCode || row.Code || `Row_${index + 1}`;
          
          // Validate each field based on the field instructions
          validationRules.forEach(rule => {
            const fieldName = rule.sap_field_name;
            const fieldValue = row[fieldName];
            const isMandatory = rule.is_mandatory;
            const dataType = rule.data_type;
            const fieldLength = rule.field_length;
            const validValues = rule.valid_values;
            
            console.log(`Validating field: ${fieldName}, Value: ${fieldValue}, Length: ${fieldLength}, Mandatory: ${isMandatory}`);
            
            // Check mandatory fields
            if (isMandatory && (!fieldValue || fieldValue.toString().trim() === '')) {
              rowErrors.push(`${fieldName} is mandatory but missing`);
              fieldsWithIssues.push(fieldName);
            }
            
            // Check data type
            if (fieldValue && fieldValue.toString().trim() !== '') {
              if (dataType === 'string' && typeof fieldValue !== 'string') {
                rowWarnings.push(`${fieldName} should be a string`);
                fieldsWithIssues.push(fieldName);
              } else if (dataType === 'integer' && isNaN(parseInt(fieldValue))) {
                rowErrors.push(`${fieldName} should be a number`);
                fieldsWithIssues.push(fieldName);
              } else if (dataType === 'double' && isNaN(parseFloat(fieldValue))) {
                rowErrors.push(`${fieldName} should be a decimal number`);
                fieldsWithIssues.push(fieldName);
              } else if (dataType === 'Date' && isNaN(Date.parse(fieldValue))) {
                rowErrors.push(`${fieldName} should be a valid date`);
                fieldsWithIssues.push(fieldName);
              }
            }
            
            // Check field length - this is the key fix
            if (fieldValue && fieldLength && fieldValue.toString().length > fieldLength) {
              rowErrors.push(`${fieldName} exceeds maximum length of ${fieldLength} characters (current: ${fieldValue.toString().length})`);
              fieldsWithIssues.push(fieldName);
            }
            
            // Check valid values
            if (fieldValue && validValues && validValues.length > 0) {
              const validValuesList = validValues.split(',').map(v => v.trim());
              if (!validValuesList.includes(fieldValue.toString().trim())) {
                rowWarnings.push(`${fieldName} has invalid value. Valid values: ${validValuesList.join(', ')}`);
                fieldsWithIssues.push(fieldName);
              }
            }
          });
          
          // Determine overall status for this row
          let status = 'Valid';
          if (rowErrors.length > 0) {
            status = 'Error';
            errorCount++;
          } else if (rowWarnings.length > 0) {
            status = 'Warning';
            warningCount++;
          } else {
            validCount++;
          }
          
          results.push({
            rowNumber: index + 1,
            code: primaryKey,
            status: status,
            fieldsWithIssues: fieldsWithIssues,
            message: rowErrors.length > 0 ? rowErrors.join('. ') : 
                     rowWarnings.length > 0 ? rowWarnings.join('. ') : 
                     'All validations passed',
            aiInsights: undefined
          });
        });
        
        validationResult = {
          results: results,
          summary: {
            total: data.length,
            valid: validCount,
            warnings: warningCount,
            errors: errorCount
          }
        };
      }

      // Ensure the response has the correct structure
      const response = {
          success: true,
          category: category,
          summary: validationResult.summary,
          results: validationResult.results,
        validationMethod: aiError ? 'Field-based' : 'AI',
        message: 'Data validation completed successfully'
      };

      // Add AI error information if applicable
      if (aiError) {
        response.aiError = aiError;
      }

      // Add AI recommendations if available
      if (validationResult.aiRecommendations) {
        response.aiRecommendations = validationResult.aiRecommendations;
      }

      res.status(200).json(response);
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
      
      const fields = instructions.map(row => {
        const field = {};
        Object.keys(row).forEach(key => {
          field[key] = row[key];
        });
        return field;
      });
      
      // Generate sample data
      const sampleData = generateSampleData(fields);
      
      res.status(200).json({
        success: true,
        category: category,
        headers: fields.length > 0 ? Object.keys(fields[0]) : [],
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
      // Support both old names (with spaces) and new names (without spaces)
      const subcategoryTableMap = {
        // New names (without spaces) - map to actual data tables
        'GeneralInfo': 'GeneralInfo',
        'Address': 'Address', 
        'TaxInfo': 'TaxInfo',
        'ContactPerson': 'ContactPerson',
        'StateCode': 'StateCode',
        'GroupCode': 'GroupCode',
        'Groups': 'Groups',
        'ItemDetails': 'ItemDetails',
        'Pricing': 'Pricing',
        'Inventory': 'Inventory',
        'Categories': 'Categories',
        'Specifications': 'Specifications',
        // Old names (with spaces) for backward compatibility
        'General Info': 'GeneralInfo',
        'Tax Info': 'TaxInfo',
        'Contact Person': 'ContactPerson',
        'State Code': 'StateCode',
        'Group Code': 'GroupCode',
        'Item Details': 'ItemDetails'
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
      
        console.log(`Querying table: ${tableName}`);
        
      // Query the actual data table
        const result = await pool.query(`
          SELECT 
          "SAPFiles" as sap_field_name,
          "DataBaseField" as db_field_name,
          "Description" as description,
          "DataType" as data_type,
          "FieldLength" as field_length,
          "Mandatory" as is_mandatory,
          "ValidValues" as valid_values,
          "RelatedTable" as related_table,
          "Remarks" as remarks,
          NULL as instruction_image_path,
          $1 as table_name
          FROM "${tableName}"
        ORDER BY "SAPFiles"
      `, [subcategoryName]);
      
      instructions = result.rows.map(row => {
        const field = {};
        Object.keys(row).forEach(key => {
          field[key] = row[key];
        });
        return field;
      });
      
      console.log(`Found ${instructions.length} instructions for ${subcategoryName}`);
      
      res.status(200).json({
        success: true,
        subcategory: subcategoryName,
        instructions: instructions,
        count: instructions.length
      });
    } catch (err) {
      console.error('Error in getInstructionsBySubcategory:', err);
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

  // Internal helper method to get instructions by category
  static async getInstructionsByCategoryInternal(category) {
    try {
      // Map category to actual table name
      const categoryTableMap = {
        'BusinessPartnerMasterData': 'GeneralInfo',
        'ItemMasterData': 'ItemDetails',
        'FinancialData': 'ChartOfAccounts',
        'SetUpData': 'CompanySettings',
        'AssetMasterData': 'AssetDetails'
      };
      
      const tableName = categoryTableMap[category] || 'GeneralInfo';
      
      const result = await pool.query(`
        SELECT 
          "SAPFiles" as sap_field_name,
          "DataBaseField" as db_field_name,
          "Description" as description,
          "DataType" as data_type,
          "FieldLength" as field_length,
          "Mandatory" as is_mandatory,
          "ValidValues" as valid_values,
          "RelatedTable" as related_table,
          "Remarks" as remarks,
          NULL as instruction_image_path,
          $1 as table_name
        FROM "${tableName}"
        ORDER BY "SAPFiles"
      `, [category]);
      
      const fields = result.rows.map(row => {
        const field = {};
        Object.keys(row).forEach(key => {
          field[key] = row[key];
        });
          return field;
        });
      
      return {
        success: true,
        category: category,
        fields: fields,
        count: fields.length
      };
    } catch (err) {
      console.error('Error in getInstructionsByCategoryInternal:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }

  // Dynamic field instructions method removed - using static functionality
}

module.exports = InstructionController;
