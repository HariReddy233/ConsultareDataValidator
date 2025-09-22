require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
//const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL connection configuration with environment variables
const pool = new Pool({
  user: process.env.DB_USER || "admin",
  host: process.env.DB_HOST || "45.33.94.229",
  database: process.env.DB_NAME || "sapb1validator",
  password: process.env.DB_PASSWORD || "Chung@2024",
  port: process.env.DB_PORT || 5432,
});



// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to handle database errors
const handleDatabaseError = (err, res) => {
  console.error('Database error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
};

// GET /sap_bp_master_instructions - Get all SAP BP Master Instructions
app.get('/sap_bp_master_instructions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table
      FROM "sap_bpmaster_instructions"
      ORDER BY sap_field_name
    `);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    handleDatabaseError(err, res);
  }
});

// GET /sap_bp_master_instructions/:sapFieldName - Get single instruction by SAP Field Name
app.get('/sap_bp_master_instructions/:sapFieldName', async (req, res) => {
  try {
    const { sapFieldName } = req.params;
    
    const result = await pool.query(`
      SELECT 
        sap_field_name, db_field_name, description, data_type, 
        field_length, is_mandatory, valid_values, related_table
      FROM "sap_bpmaster_instructions" 
      WHERE sap_field_name = $1
    `, [sapFieldName]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Instruction with SAP Field Name '${sapFieldName}' not found`
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    handleDatabaseError(err, res);
  }
});

// POST /sap_bp_master_instructions - Create new SAP BP Master Instruction
app.post('/sap_bp_master_instructions', async (req, res) => {
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
    
    res.status(201).json({
      success: true,
      message: 'SAP BP Master Instruction created successfully',
      data: result.rows[0]
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
});

// PUT /sap_bp_master_instructions/:sapFieldName - Update instruction by SAP Field Name
app.put('/sap_bp_master_instructions/:sapFieldName', async (req, res) => {
  try {
    const { sapFieldName } = req.params;
    const {
      db_field_name, description, data_type, 
      field_length, is_mandatory, valid_values, related_table
    } = req.body;
    
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
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Instruction with SAP Field Name '${sapFieldName}' not found`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'SAP BP Master Instruction updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    handleDatabaseError(err, res);
  }
});

// DELETE /sap_bp_master_instructions/:sapFieldName - Delete instruction by SAP Field Name
app.delete('/sap_bp_master_instructions/:sapFieldName', async (req, res) => {
  try {
    const { sapFieldName } = req.params;
    
    const result = await pool.query(`
      DELETE FROM "sap_bpmaster_instructions" 
      WHERE sap_field_name = $1
      RETURNING *
    `, [sapFieldName]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Instruction with SAP Field Name '${sapFieldName}' not found`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'SAP BP Master Instruction deleted successfully',
      data: result.rows[0]
    });
  } catch (err) {
    handleDatabaseError(err, res);
  }
});

// GET /instructions/:category - Get validation instructions for a category
app.get('/instructions/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    // Map category to table name
    const categoryMap = {
      'BusinessPartnerMasterData': 'sap_bpmaster_instructions',
      'ItemMasterData': 'Item_field_instructions',
      'FinancialData': 'sap_bpmaster_instructions',
      'SetupData': 'sap_bpmaster_instructions'
    };
    
    const tableName = categoryMap[category] || 'sap_bpmaster_instructions';
    
    console.log(`Fetching instructions for category: ${category}, table: ${tableName}`);
    
    // First, let's check if the table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name ILIKE '%item%field%instructions%'
    `);
    
    console.log('Available tables with item field instructions:', tableCheck.rows);
    
    // Check the structure of the table
    if (tableCheck.rows.length > 0) {
      const tableName = tableCheck.rows[0].table_name;
      const columnCheck = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        ORDER BY ordinal_position
      `);
      console.log(`Columns in ${tableName}:`, columnCheck.rows);
    }
    
    let result;
    try {
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
    } catch (tableError) {
      console.log(`Failed with table name "${tableName}", trying alternatives...`);
      
      // Try alternative table names
      const alternatives = [
        'Item_field_instructions',
        'item_field_instructions', 
        'Item_Field_Instructions',
        'ITEM_FIELD_INSTRUCTIONS'
      ];
      
      let found = false;
      for (const altTable of alternatives) {
        try {
          console.log(`Trying table name: ${altTable}`);
          if (category === 'ItemMasterData') {
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
              FROM "${altTable}"
              ORDER BY field_name
            `);
          } else {
            result = await pool.query(`
              SELECT DISTINCT
                sap_field_name, db_field_name, description, data_type, 
                field_length, is_mandatory, valid_values, related_table
              FROM "${altTable}"
              ORDER BY sap_field_name
            `);
          }
          console.log(`Success with table name: ${altTable}`);
          found = true;
          break;
        } catch (altError) {
          console.log(`Failed with table name: ${altTable}`);
          continue;
        }
      }
      
      if (!found) {
        throw tableError; // Throw the original error if no alternative worked
      }
    }
    
    // Transform data to match expected format
    const fields = result.rows.map(row => ({
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
      fields: fields
    });
  } catch (err) {
    console.error(`Error fetching instructions for category ${req.params.category}:`, err);
    handleDatabaseError(err, res);
  }
});

// POST /validate/:category - Validate uploaded Excel file
app.post('/validate/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { data } = req.body; // Excel data will be sent from frontend
    
    // Map category to table name
    const categoryMap = {
      'BusinessPartnerMasterData': 'sap_bpmaster_instructions',
      'ItemMasterData': 'Item_field_instructions',
      'FinancialData': 'sap_bpmaster_instructions',
      'SetupData': 'sap_bpmaster_instructions'
    };
    
    const tableName = categoryMap[category] || 'sap_bpmaster_instructions';
    
    // Get validation rules for the category
    let instructionsResult;
    try {
      if (category === 'ItemMasterData') {
        // Use different column names for Item_field_instructions table
        instructionsResult = await pool.query(`
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
        instructionsResult = await pool.query(`
          SELECT DISTINCT
            sap_field_name, db_field_name, description, data_type, 
            field_length, is_mandatory, valid_values, related_table
          FROM "${tableName}"
          ORDER BY sap_field_name
        `);
      }
    } catch (tableError) {
      // Try alternative table names for Item Master Data
      if (category === 'ItemMasterData') {
        const alternatives = [
          'Item_field_instructions',
          'item_field_instructions', 
          'Item_Field_Instructions',
          'ITEM_FIELD_INSTRUCTIONS'
        ];
        
        let found = false;
        for (const altTable of alternatives) {
          try {
            instructionsResult = await pool.query(`
              SELECT DISTINCT
                field_name as sap_field_name,
                field_name as db_field_name,
                '' as description,
                data_type, 
                field_length, 
                is_mandatory, 
                '' as valid_values, 
                '' as related_table
              FROM "${altTable}"
              ORDER BY field_name
            `);
            found = true;
            break;
          } catch (altError) {
            continue;
          }
        }
        
        if (!found) {
          throw tableError;
        }
      } else {
        throw tableError;
      }
    }
    
    const validationRules = instructionsResult.rows.map(row => ({
      sapFile: row.sap_field_name,
      dbField: row.db_field_name,
      description: row.description,
      type: row.data_type,
      length: parseInt(row.field_length) || 0,
      mandatory: row.is_mandatory === 'Y',
      validValues: row.valid_values ? row.valid_values.split(',').map(v => v.trim()) : null,
      relatedTable: row.related_table
    }));
    
    // Validation logic
    const validationResults = [];
    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    
    data.forEach((row, index) => {
      const rowNumber = index + 1;
      const errors = [];
      const warnings = [];
      
      validationRules.forEach(rule => {
        const value = row[rule.sapFile];
        
        // Check mandatory fields
        if (rule.mandatory && (!value || value.toString().trim() === '')) {
          errors.push(`${rule.sapFile} - Field is mandatory and cannot be empty`);
        }
        
        // Check field length
        if (value && value.toString().length > rule.length) {
          errors.push(`${rule.sapFile} - Field length exceeds maximum of ${rule.length} characters`);
        }
        
        // Check valid values
        if (value && rule.validValues && !rule.validValues.includes(value.toString())) {
          errors.push(`${rule.sapFile} - Invalid value. Must be one of: ${rule.validValues.join(', ')}`);
        }
        
        // Check data type
        if (value && rule.type === 'Integer' && isNaN(parseInt(value))) {
          errors.push(`${rule.sapFile} - Must be a valid integer`);
        }
      });
      
      const status = errors.length > 0 ? 'Error' : warnings.length > 0 ? 'Warning' : 'Valid';
      
      if (status === 'Valid') validCount++;
      else if (status === 'Warning') warningCount++;
      else errorCount++;
      
      validationResults.push({
        rowNumber,
        code: row[validationRules[0]?.sapFile] || `Row ${rowNumber}`,
        status,
        fieldsWithIssues: [...errors, ...warnings].map(e => e.split(' - ')[0]),
        message: errors.length > 0 ? errors.join('; ') : warnings.length > 0 ? warnings.join('; ') : 'No errors found'
      });
    });
    
    res.status(200).json({
      success: true,
      category: category,
      summary: {
        total: data.length,
        valid: validCount,
        warnings: warningCount,
        errors: errorCount
      },
      results: validationResults
    });
  } catch (err) {
    handleDatabaseError(err, res);
  }
});

// GET /download-sample/:category - Generate and download sample Excel file
app.get('/download-sample/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    // Map category to table name
    const categoryMap = {
      'BusinessPartnerMasterData': 'sap_bpmaster_instructions',
      'ItemMasterData': 'Item_field_instructions',
      'FinancialData': 'sap_bpmaster_instructions',
      'SetupData': 'sap_bpmaster_instructions'
    };
    
    const tableName = categoryMap[category] || 'sap_bpmaster_instructions';
    
    // Get validation rules
    let instructionsResult;
    try {
      if (category === 'ItemMasterData') {
        // Use different column names for Item_field_instructions table
        instructionsResult = await pool.query(`
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
        instructionsResult = await pool.query(`
          SELECT DISTINCT
            sap_field_name, db_field_name, description, data_type, 
            field_length, is_mandatory, valid_values, related_table
          FROM "${tableName}"
          ORDER BY sap_field_name
        `);
      }
    } catch (tableError) {
      // Try alternative table names for Item Master Data
      if (category === 'ItemMasterData') {
        const alternatives = [
          'Item_field_instructions',
          'item_field_instructions', 
          'Item_Field_Instructions',
          'ITEM_FIELD_INSTRUCTIONS'
        ];
        
        let found = false;
        for (const altTable of alternatives) {
          try {
            instructionsResult = await pool.query(`
              SELECT DISTINCT
                field_name as sap_field_name,
                field_name as db_field_name,
                '' as description,
                data_type, 
                field_length, 
                is_mandatory, 
                '' as valid_values, 
                '' as related_table
              FROM "${altTable}"
              ORDER BY field_name
            `);
            found = true;
            break;
          } catch (altError) {
            continue;
          }
        }
        
        if (!found) {
          throw tableError;
        }
      } else {
        throw tableError;
      }
    }
    
    const fields = instructionsResult.rows.map(row => ({
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
    const sampleData = fields.map(field => {
      let sampleValue = '';
      
      if (field.validValues && field.validValues.length > 0) {
        sampleValue = field.validValues[0];
      } else if (field.type === 'Integer') {
        sampleValue = '123';
      } else if (field.type === 'String') {
        sampleValue = `Sample ${field.sapFile}`;
      } else {
        sampleValue = 'Sample Value';
      }
      
      return {
        [field.sapFile]: sampleValue
      };
    });
    
    res.status(200).json({
      success: true,
      category: category,
      headers: fields.map(f => f.sapFile),
      sampleData: sampleData
    });
  } catch (err) {
    handleDatabaseError(err, res);
  }
});

// Debug endpoint to check table names
app.get('/debug/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name ILIKE '%item%' OR table_name ILIKE '%instruction%')
      ORDER BY table_name
    `);
    
    res.status(200).json({
      success: true,
      tables: result.rows.map(row => row.table_name)
    });
  } catch (err) {
    handleDatabaseError(err, res);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints:`);
  console.log(`  GET    /sap_bp_master_instructions`);
  console.log(`  GET    /sap_bp_master_instructions/:sapFieldName`);
  console.log(`  POST   /sap_bp_master_instructions`);
  console.log(`  PUT    /sap_bp_master_instructions/:sapFieldName`);
  console.log(`  DELETE /sap_bp_master_instructions/:sapFieldName`);
  console.log(`  GET    /instructions/:category`);
  console.log(`  POST   /validate/:category`);
  console.log(`  GET    /download-sample/:category`);
  console.log(`  GET    /debug/tables`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});


