const Instruction = require('../models/Instruction');
const { handleDatabaseError } = require('../utils/errorHandler');
const { validateData, generateSampleData } = require('../utils/validation');

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

  // POST /validate/:category - Validate uploaded Excel file
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
        relatedTable: row.related_table
      }));
      
      // Perform validation
      const validationResult = validateData(data, validationRules);
      
      res.status(200).json({
        success: true,
        category: category,
        summary: validationResult.summary,
        results: validationResult.results
      });
    } catch (err) {
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
      const tables = await Instruction.getTableNames();
      
      res.status(200).json({
        success: true,
        tables: tables
      });
    } catch (err) {
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
}

module.exports = InstructionController;
