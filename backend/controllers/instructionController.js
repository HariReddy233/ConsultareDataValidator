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
      
      // First, let's check what categories are available
      const availableCategories = await pool.query(`
        SELECT "MainCategoryName" 
        FROM "SAP_MainCategories" 
        ORDER BY "MainCategoryName"
      `);
      console.log('Available categories:', availableCategories.rows.map(r => r.MainCategoryName));
      
      // Use the internal method that fetches from individual tables
      const result = await this.getInstructionsByCategoryInternal(category);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
          fields: [],
          count: 0,
          availableCategories: availableCategories.rows.map(r => r.MainCategoryName)
        });
      }
      
      res.status(200).json({
        success: true,
        category: category,
        fields: result.fields,
        count: result.count,
        source: 'individual_tables'
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
      console.log(`Data received: ${data ? data.length : 0} rows`);
      
      // Set longer timeout for large datasets
      res.setTimeout(120000); // 2 minutes
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data provided for validation'
        });
      }

      // For very large datasets, process in chunks to avoid memory issues
      const CHUNK_SIZE = 1000; // Process 1000 rows at a time
      const isLargeDataset = data.length > CHUNK_SIZE;
      
      if (isLargeDataset) {
        console.log(`Large dataset detected (${data.length} rows). Processing in chunks of ${CHUNK_SIZE}.`);
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

      // Try AI validation first
      let validationResult;
      let aiError = null;
      
      try {
        console.log('Attempting AI validation...');
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
        console.warn('AI validation failed, falling back to basic validation:', aiErr.message);
        aiError = aiErr.message;
        
        // Fallback to basic validation
        validationResult = {
          results: data.map((row, index) => ({
            rowNumber: index + 1,
            code: row.CardCode || row.ItemCode || row.Code || `Row_${index + 1}`,
            status: 'Valid',
            fieldsWithIssues: [],
            message: aiError && aiError.includes('OpenAI API key not provided') 
              ? 'Basic validation passed - AI validation requires OpenAI API key configuration'
              : 'Basic validation passed - AI validation temporarily unavailable',
            aiInsights: aiError && aiError.includes('OpenAI API key not provided')
              ? 'To enable AI validation, configure OPENAI_API_KEY in environment variables'
              : 'AI validation service is currently unavailable'
          })),
          summary: {
            total: data.length,
            valid: data.length,
            warnings: 0,
            errors: 0
          },
          aiRecommendations: aiError && aiError.includes('OpenAI API key not provided')
            ? 'AI validation requires OpenAI API key configuration. Add OPENAI_API_KEY to your environment variables to enable advanced AI-powered validation features.'
            : 'AI validation was temporarily unavailable. Basic validation completed successfully.'
        };
      }

      // Ensure the response has the correct structure
      const response = {
        success: true,
        category: category,
        summary: validationResult.summary || {
          total: data.length,
          valid: data.length,
          warnings: 0,
          errors: 0
        },
        results: validationResult.results || [],
        validationMethod: aiError ? 'Basic' : 'AI',
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

  // Debug method to get available categories
  static async getAvailableCategories(req, res) {
    try {
      // Get main categories
      const mainCategories = await pool.query(`
        SELECT "MainCategoryID", "MainCategoryName" 
        FROM "SAP_MainCategories" 
        ORDER BY "MainCategoryName"
      `);
      
      // Get subcategories with their data tables
      const subcategories = await pool.query(`
        SELECT 
          sc."SubCategoryID",
          sc."SubCategoryName", 
          sc."Data_Table",
          mc."MainCategoryName"
        FROM "SAP_SubCategories" sc
        JOIN "SAP_MainCategories" mc ON sc."MainCategoryID" = mc."MainCategoryID"
        ORDER BY mc."MainCategoryName", sc."SubCategoryName"
      `);
      
      res.status(200).json({
        success: true,
        mainCategories: mainCategories.rows,
        subcategories: subcategories.rows,
        totalMainCategories: mainCategories.rows.length,
        totalSubcategories: subcategories.rows.length
      });
    } catch (err) {
      console.error('Error getting available categories:', err);
      handleDatabaseError(err, res);
    }
  }

  // GET /instructions/subcategory/:subcategoryName - Get instructions by subcategory name
  static async getInstructionsBySubcategory(req, res) {
    try {
      const { subcategoryName } = req.params;
      
      console.log(`Looking for subcategory: ${subcategoryName}`);
      
      // First, get the Data_Table value from SAP_SubCategories table
      const subcategoryResult = await pool.query(`
        SELECT "Data_Table" 
        FROM "SAP_SubCategories" 
        WHERE "SubCategoryName" = $1
      `, [subcategoryName]);
      
      if (subcategoryResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Subcategory not found: ${subcategoryName}`
        });
      }
      
      const dataTable = subcategoryResult.rows[0].Data_Table;
      console.log(`Found Data_Table: ${dataTable} for subcategory: ${subcategoryName}`);
      
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
        return res.status(404).json({
          success: false,
          message: `Data table '${dataTable}' does not exist`
        });
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
      
      let instructions = [];
      
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
        
        instructions = result.rows;
        console.log(`Found ${instructions.length} instructions from ${dataTable} table`);
      } else {
        // Fallback to sap_bpmaster_instructions table
        const result = await pool.query(`
          SELECT 
            sap_field_name,
            db_field_name,
            description,
            data_type,
            field_length,
            is_mandatory,
            valid_values,
            related_table,
            remarks,
            instruction_image_path,
            table_name
          FROM sap_bpmaster_instructions
          WHERE table_name = $1
          ORDER BY sap_field_name
        `, [dataTable]);
        
        instructions = result.rows;
        console.log(`Found ${instructions.length} instructions from sap_bpmaster_instructions table`);
      }
      
      res.status(200).json({
        success: true,
        subcategory: subcategoryName,
        dataTable: dataTable,
        instructions: instructions,
        fields: instructions,
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
      // Get all Data_Table values for the given category from SAP_SubCategories
      const subcategoryResult = await pool.query(`
        SELECT DISTINCT "Data_Table" 
        FROM "SAP_SubCategories" sc
        JOIN "SAP_MainCategories" mc ON sc."MainCategoryID" = mc."MainCategoryID"
        WHERE mc."MainCategoryName" = $1
      `, [category]);
      
      if (subcategoryResult.rows.length === 0) {
        return {
          success: false,
          error: `No subcategories found for category: ${category}`,
          fields: [],
          count: 0
        };
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
                sap_field_name,
                db_field_name,
                description,
                data_type,
                field_length,
                is_mandatory,
                valid_values,
                related_table,
                remarks,
                instruction_image_path,
                table_name
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
      
      return {
        success: true,
        category: category,
        fields: allFields,
        count: allFields.length
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
