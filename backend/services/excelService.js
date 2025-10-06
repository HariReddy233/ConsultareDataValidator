const XLSX = require('xlsx');
const { withClient } = require('../utils/database');
const { ulid } = require('ulid');

class ExcelService {
  // Process Excel file and update data in existing table
  async processExcelSchema(file, category, subcategory) {
    return withClient(async (client) => {
      try {
        // Parse Excel file
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          throw new Error('Excel file is empty');
        }

        // Get headers from first row
        const headers = jsonData[0].filter(header => header && header.toString().trim() !== '');
        const dataRows = jsonData.slice(1).filter(row => 
          row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '')
        ).map(row => {
          // Convert array row to object with headers as keys
          const rowObj = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index];
          });
          return rowObj;
        });

        console.log('=== EXCEL DATA UPDATE DEBUG ===');
        console.log('Headers found:', headers);
        console.log('Data rows count:', dataRows.length);
        console.log('First data row:', dataRows[0]);
        console.log('===============================');

        if (dataRows.length === 0) {
          throw new Error('No data rows found in Excel file');
        }

        // Get table name from database configuration
        const tableName = await this.getTableNameFromDatabase(client, subcategory);
        console.log(`Table name for ${subcategory}: ${tableName}`);

        if (!tableName) {
          throw new Error(`No table configuration found for subcategory: ${subcategory}`);
        }

        // Check if table exists
        const tableExists = await this.tableExists(client, tableName);
        if (!tableExists) {
          throw new Error(`Table ${tableName} does not exist. Please create the table structure first.`);
        }

        // Upsert data (insert or update based on primary key)
        console.log(`Upserting ${dataRows.length} rows into ${tableName}...`);
        await this.upsertData(client, tableName, headers, dataRows);

        // Get final row count
        const finalRowCount = await this.getTableRowCount(client, tableName);
        console.log(`Final row count for ${tableName}: ${finalRowCount}`);

        return {
          success: true,
          message: `Excel data upserted successfully. Table: ${tableName}, Rows: ${finalRowCount}`,
          tableName: tableName,
          rowCount: finalRowCount,
          headers: headers
        };
      } catch (error) {
        console.error('Error processing Excel file:', error);
        throw new Error(`Failed to process Excel file: ${error.message}`);
      }
    });
  }

  // Get table name from database based on subcategory
  async getTableNameFromDatabase(client, subcategory) {
    try {
      const query = `
        SELECT "Data_Table" 
        FROM "SAP_SubCategories" 
        WHERE "SubCategoryName" = $1
      `;
      
      const result = await client.query(query, [subcategory]);
      
      if (result.rows.length === 0) {
        throw new Error(`Subcategory '${subcategory}' not found in database`);
      }

      const dataTable = result.rows[0].Data_Table;
      
      if (!dataTable) {
        throw new Error(`No Data_Table configured for subcategory '${subcategory}'`);
      }

      return dataTable;
    } catch (error) {
      console.error('Error getting table name from database:', error);
      throw error;
    }
  }

  // Generate table name from category (use category name as table name) - FALLBACK ONLY
  generateTableName(category, subcategory) {
    const baseName = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return baseName; // Use category name directly as table name
  }

  // Check if table exists
  async tableExists(client, tableName) {
    try {
      const query = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      const result = await client.query(query, [tableName]);
      return result.rows[0].exists;
    } catch (error) {
      console.error('Error checking table existence:', error);
      return false;
    }
  }

  // createTable method removed - using static table structure

  // updateTable method removed - using static table structure

  // Insert data into table
  async insertData(client, tableName, headers, dataRows, originalHeaders = null) {
    if (dataRows.length === 0) return;

    console.log(`Inserting data into table: ${tableName}`);
    console.log(`Headers (sanitized):`, headers);
    console.log(`Original headers:`, originalHeaders || headers);
    
    // Use sanitized headers for SQL query
    const columnNames = headers;
    console.log(`Using column names:`, columnNames);
    
    const placeholders = columnNames.map((_, index) => `$${index + 1}`).join(', ');
    
    const insertQuery = `
      INSERT INTO "${tableName}" (${columnNames.map(name => `"${name}"`).join(', ')})
      VALUES (${placeholders})
    `;
    
    console.log(`Insert query:`, insertQuery);

    // Insert data in batches of 1000 rows
    const batchSize = 1000;
    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize);
      
      for (const row of batch) {
        // Use the original headers to get values from the row data
        const dataHeaders = originalHeaders || headers;
        const values = dataHeaders.map(header => {
          const value = row[header]; // Use header as key to get value from row object
          return value !== null && value !== undefined ? value.toString() : null;
        });
        
        console.log(`Inserting values for row:`, values);
        await client.query(insertQuery, values);
      }
    }
  }

  // Upsert data (insert or update based on primary key)
  async upsertData(client, tableName, headers, dataRows, originalHeaders = null) {
    if (dataRows.length === 0) return;

    console.log(`Upserting data into table: ${tableName}`);
    console.log(`Headers (sanitized):`, headers);
    console.log(`Original headers:`, originalHeaders || headers);
    
    // Use sanitized headers for SQL query
    const columnNames = headers;
    console.log(`Using column names:`, columnNames);
    
    // Get table structure to identify primary key
    const tableColumns = await this.getTableColumns(client, tableName);
    const primaryKeyColumn = tableColumns.find(col => col.column_name === 'id') || 
                            tableColumns.find(col => col.column_name === 'sap_field_name') ||
                            tableColumns.find(col => col.column_name === 'db_field_name');
    
    if (!primaryKeyColumn) {
      console.log('No primary key found, falling back to insert only');
      return await this.insertData(client, tableName, headers, dataRows, originalHeaders);
    }
    
    const primaryKey = primaryKeyColumn.column_name;
    console.log(`Using primary key: ${primaryKey}`);
    
    // Create upsert query using ON CONFLICT
    const placeholders = columnNames.map((_, index) => `$${index + 1}`).join(', ');
    const updateClause = columnNames
      .filter(col => col !== primaryKey)
      .map(col => `"${col}" = EXCLUDED."${col}"`)
      .join(', ');
    
    const upsertQuery = `
      INSERT INTO "${tableName}" (${columnNames.map(name => `"${name}"`).join(', ')})
      VALUES (${placeholders})
      ON CONFLICT ("${primaryKey}") 
      DO UPDATE SET ${updateClause}
    `;
    
    console.log(`Upsert query:`, upsertQuery);

    // Upsert data in batches of 1000 rows
    const batchSize = 1000;
    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize);
      
      for (const row of batch) {
        // Use the original headers to get values from the row data
        const dataHeaders = originalHeaders || headers;
        const values = dataHeaders.map(header => {
          const value = row[header]; // Use header as key to get value from row object
          return value !== null && value !== undefined ? value.toString() : null;
        });
        
        console.log(`Upserting values for row:`, values);
        await client.query(upsertQuery, values);
      }
    }
  }

  // Get table columns
  async getTableColumns(client, tableName) {
    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    const result = await client.query(query, [tableName]);
    return result.rows;
  }

  // Sanitize column name for database
  sanitizeColumnName(header) {
    console.log(`Sanitizing column name: "${header}"`);
    
    let sanitized = header
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 63); // PostgreSQL column name limit
    
    console.log(`After basic sanitization: "${sanitized}"`);
    
    // Ensure it doesn't conflict with system columns or contain system column names
    if (sanitized === 'id' || sanitized === 'created_at' || sanitized === 'updated_at' || 
        sanitized.includes('_created_at') || sanitized.includes('_updated_at') || 
        sanitized.startsWith('id_') || sanitized.endsWith('_id')) {
      sanitized = 'excel_' + sanitized;
      console.log(`After system column check: "${sanitized}"`);
    }
    
    // Ensure it's not empty
    if (!sanitized || sanitized.length === 0) {
      sanitized = 'field_' + Math.random().toString(36).substr(2, 9);
      console.log(`After empty check: "${sanitized}"`);
    }
    
    // Ensure it doesn't start with a number
    if (/^[0-9]/.test(sanitized)) {
      sanitized = 'col_' + sanitized;
      console.log(`After number start check: "${sanitized}"`);
    }
    
    // Final validation - ensure it's a valid PostgreSQL identifier
    if (!/^[a-z_][a-z0-9_]*$/i.test(sanitized)) {
      sanitized = 'col_' + sanitized.replace(/[^a-z0-9_]/gi, '_');
      console.log(`After final validation: "${sanitized}"`);
    }
    
    console.log(`Final sanitized column name: "${sanitized}"`);
    return sanitized;
  }

  // Get table schema
  async getTableSchema(category, subcategory) {
    return withClient(async (client) => {
      try {
        const tableName = await this.getTableNameFromDatabase(client, subcategory);
        const exists = await this.tableExists(client, tableName);
        
        if (!exists) {
          return { exists: false, tableName, columns: [] };
        }

        const columns = await this.getTableColumns(client, tableName);
        const rowCount = await this.getTableRowCount(client, tableName);

        return {
          exists: true,
          tableName,
          columns,
          rowCount
        };
      } catch (error) {
        console.error('Get table schema error:', error);
        throw new Error(`Failed to get table schema: ${error.message}`);
      }
    });
  }

  // Get table row count
  async getTableRowCount(client, tableName) {
    const query = `SELECT COUNT(*) as count FROM "${tableName}";`;
    const result = await client.query(query);
    return parseInt(result.rows[0].count);
  }

  // Get table data with pagination
  async getTableData(category, subcategory, page = 1, limit = 100) {
    return withClient(async (client) => {
      try {
        const tableName = await this.getTableNameFromDatabase(client, subcategory);
        const exists = await this.tableExists(client, tableName);
        
        if (!exists) {
          return { exists: false, data: [], totalCount: 0, page, limit };
        }

        const offset = (page - 1) * limit;
        const totalCount = await this.getTableRowCount(client, tableName);

        const query = `
          SELECT * FROM "${tableName}"
          ORDER BY created_at DESC
          LIMIT $1 OFFSET $2
        `;
        
        const result = await client.query(query, [limit, offset]);
        
        return {
          exists: true,
          data: result.rows,
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        };
      } catch (error) {
        console.error('Get table data error:', error);
        throw new Error(`Failed to get table data: ${error.message}`);
      }
    });
  }

  // Delete table
  async deleteTable(category, subcategory) {
    return withClient(async (client) => {
      try {
        const tableName = await this.getTableNameFromDatabase(client, subcategory);
        const exists = await this.tableExists(client, tableName);
        
        if (!exists) {
          throw new Error('Table does not exist');
        }

        await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        
        return { message: `Table ${tableName} deleted successfully` };
      } catch (error) {
        console.error('Delete table error:', error);
        throw new Error(`Failed to delete table: ${error.message}`);
      }
    });
  }
}

module.exports = new ExcelService();
