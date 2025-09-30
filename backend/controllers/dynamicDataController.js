const { pool } = require('../config/database');
const { generateResponse } = require('../utils/genRes');
const { handleDatabaseError } = require('../utils/errorHandler');

class DynamicDataController {
  // GET /api/dynamic-data/:category - Get data from any table based on category
  static async getDataByCategory(req, res) {
    try {
      const { category } = req.params;
      const { page = 1, limit = 50, search = '', sortBy = 'id', sortOrder = 'ASC' } = req.query;

      // First, get the data table name for this category
      const categoryQuery = `
        SELECT "Data_Table", "SubCategoryName" 
        FROM "SAP_SubCategories" 
        WHERE "SubCategoryName" = $1
      `;
      
      const categoryResult = await pool.query(categoryQuery, [category]);
      
      if (categoryResult.rows.length === 0) {
        return res.status(404).json(
          generateResponse(false, 'Category not found', 404, null)
        );
      }

      const { Data_Table: tableName, SubCategoryName: subCategoryName } = categoryResult.rows[0];
      
      if (!tableName) {
        return res.status(400).json(
          generateResponse(false, 'No data table configured for this category', 400, null)
        );
      }

      // Check if table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      
      const tableExistsResult = await pool.query(tableExistsQuery, [tableName]);
      
      if (!tableExistsResult.rows[0].exists) {
        return res.status(400).json(
          generateResponse(false, `Data table '${tableName}' does not exist`, 400, null)
        );
      }

      // Get table structure to build dynamic query
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const columnsResult = await pool.query(columnsQuery, [tableName]);
      const columns = columnsResult.rows.map(col => col.column_name);

      // Build search conditions
      let searchConditions = '';
      let searchParams = [];
      
      if (search) {
        const searchableColumns = columns.filter(col => 
          !col.includes('id') && 
          !col.includes('created') && 
          !col.includes('updated')
        );
        
        if (searchableColumns.length > 0) {
          const searchClauses = searchableColumns.map((col, index) => 
            `${col}::text ILIKE $${index + 1}`
          );
          searchConditions = `WHERE ${searchClauses.join(' OR ')}`;
          searchParams = searchableColumns.map(() => `%${search}%`);
        }
      }

      // Build sorting
      const validSortColumn = columns.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM "${tableName}" ${searchConditions}`;
      const countResult = await pool.query(countQuery, searchParams);
      const totalRecords = parseInt(countResult.rows[0].total);

      // Calculate pagination
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(totalRecords / limit);

      // Get data with pagination
      const dataQuery = `
        SELECT * FROM "${tableName}" 
        ${searchConditions}
        ORDER BY "${validSortColumn}" ${validSortOrder}
        LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
      `;
      
      const dataParams = [...searchParams, limit, offset];
      const dataResult = await pool.query(dataQuery, dataParams);

      // Format response
      const response = {
        category: subCategoryName,
        tableName: tableName,
        columns: columns,
        data: dataResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalRecords: totalRecords,
          limit: parseInt(limit),
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        search: search,
        sort: {
          by: validSortColumn,
          order: validSortOrder
        }
      };

      res.status(200).json(
        generateResponse(true, 'Data retrieved successfully', 200, response)
      );

    } catch (error) {
      console.error('Error in getDataByCategory:', error);
      handleDatabaseError(error, res);
    }
  }

  // GET /api/dynamic-data/:category/columns - Get column information for a category
  static async getColumnInfo(req, res) {
    try {
      const { category } = req.params;

      // Get the data table name for this category
      const categoryQuery = `
        SELECT "Data_Table", "SubCategoryName" 
        FROM "SAP_SubCategories" 
        WHERE "SubCategoryName" = $1
      `;
      
      const categoryResult = await pool.query(categoryQuery, [category]);
      
      if (categoryResult.rows.length === 0) {
        return res.status(404).json(
          generateResponse(false, 'Category not found', 404, null)
        );
      }

      const { Data_Table: tableName, SubCategoryName: subCategoryName } = categoryResult.rows[0];
      
      if (!tableName) {
        return res.status(400).json(
          generateResponse(false, 'No data table configured for this category', 400, null)
        );
      }

      // Get detailed column information
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const columnsResult = await pool.query(columnsQuery, [tableName]);

      const response = {
        category: subCategoryName,
        tableName: tableName,
        columns: columnsResult.rows.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          defaultValue: col.column_default,
          maxLength: col.character_maximum_length,
          precision: col.numeric_precision,
          scale: col.numeric_scale
        }))
      };

      res.status(200).json(
        generateResponse(true, 'Column information retrieved successfully', 200, response)
      );

    } catch (error) {
      console.error('Error in getColumnInfo:', error);
      handleDatabaseError(error, res);
    }
  }

  // POST /api/dynamic-data/:category - Insert data into the table
  static async insertData(req, res) {
    try {
      const { category } = req.params;
      const data = req.body;

      // Get the data table name for this category
      const categoryQuery = `
        SELECT "Data_Table" 
        FROM "SAP_SubCategories" 
        WHERE "SubCategoryName" = $1
      `;
      
      const categoryResult = await pool.query(categoryQuery, [category]);
      
      if (categoryResult.rows.length === 0) {
        return res.status(404).json(
          generateResponse(false, 'Category not found', 404, null)
        );
      }

      const { Data_Table: tableName } = categoryResult.rows[0];
      
      if (!tableName) {
        return res.status(400).json(
          generateResponse(false, 'No data table configured for this category', 400, null)
        );
      }

      // Get table columns
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const columnsResult = await pool.query(columnsQuery, [tableName]);
      const columns = columnsResult.rows.map(col => col.column_name);

      // Filter data to only include valid columns
      const validData = {};
      Object.keys(data).forEach(key => {
        if (columns.includes(key)) {
          validData[key] = data[key];
        }
      });

      if (Object.keys(validData).length === 0) {
        return res.status(400).json(
          generateResponse(false, 'No valid data provided', 400, null)
        );
      }

      // Build insert query
      const insertColumns = Object.keys(validData);
      const insertValues = Object.values(validData);
      const placeholders = insertValues.map((_, index) => `$${index + 1}`).join(', ');

      const insertQuery = `
        INSERT INTO "${tableName}" (${insertColumns.map(col => `"${col}"`).join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await pool.query(insertQuery, insertValues);

      res.status(201).json(
        generateResponse(true, 'Data inserted successfully', 201, {
          category: category,
          tableName: tableName,
          insertedData: result.rows[0]
        })
      );

    } catch (error) {
      console.error('Error in insertData:', error);
      handleDatabaseError(error, res);
    }
  }

  // PUT /api/dynamic-data/:category/:id - Update data in the table
  static async updateData(req, res) {
    try {
      const { category, id } = req.params;
      const data = req.body;

      // Get the data table name for this category
      const categoryQuery = `
        SELECT "Data_Table" 
        FROM "SAP_SubCategories" 
        WHERE "SubCategoryName" = $1
      `;
      
      const categoryResult = await pool.query(categoryQuery, [category]);
      
      if (categoryResult.rows.length === 0) {
        return res.status(404).json(
          generateResponse(false, 'Category not found', 404, null)
        );
      }

      const { Data_Table: tableName } = categoryResult.rows[0];
      
      if (!tableName) {
        return res.status(400).json(
          generateResponse(false, 'No data table configured for this category', 400, null)
        );
      }

      // Get table columns
      const columnsQuery = `
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const columnsResult = await pool.query(columnsQuery, [tableName]);
      const columns = columnsResult.rows.map(col => col.column_name);

      // Filter data to only include valid columns
      const validData = {};
      Object.keys(data).forEach(key => {
        if (columns.includes(key)) {
          validData[key] = data[key];
        }
      });

      if (Object.keys(validData).length === 0) {
        return res.status(400).json(
          generateResponse(false, 'No valid data provided', 400, null)
        );
      }

      // Build update query
      const updateColumns = Object.keys(validData);
      const updateValues = Object.values(validData);
      const setClause = updateColumns.map((col, index) => `"${col}" = $${index + 2}`).join(', ');

      const updateQuery = `
        UPDATE "${tableName}" 
        SET ${setClause}
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [id, ...updateValues]);

      if (result.rows.length === 0) {
        return res.status(404).json(
          generateResponse(false, 'Record not found', 404, null)
        );
      }

      res.status(200).json(
        generateResponse(true, 'Data updated successfully', 200, {
          category: category,
          tableName: tableName,
          updatedData: result.rows[0]
        })
      );

    } catch (error) {
      console.error('Error in updateData:', error);
      handleDatabaseError(error, res);
    }
  }

  // DELETE /api/dynamic-data/:category/:id - Delete data from the table
  static async deleteData(req, res) {
    try {
      const { category, id } = req.params;

      // Get the data table name for this category
      const categoryQuery = `
        SELECT "Data_Table" 
        FROM "SAP_SubCategories" 
        WHERE "SubCategoryName" = $1
      `;
      
      const categoryResult = await pool.query(categoryQuery, [category]);
      
      if (categoryResult.rows.length === 0) {
        return res.status(404).json(
          generateResponse(false, 'Category not found', 404, null)
        );
      }

      const { Data_Table: tableName } = categoryResult.rows[0];
      
      if (!tableName) {
        return res.status(400).json(
          generateResponse(false, 'No data table configured for this category', 400, null)
        );
      }

      const deleteQuery = `DELETE FROM "${tableName}" WHERE id = $1 RETURNING *`;
      const result = await pool.query(deleteQuery, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json(
          generateResponse(false, 'Record not found', 404, null)
        );
      }

      res.status(200).json(
        generateResponse(true, 'Data deleted successfully', 200, {
          category: category,
          tableName: tableName,
          deletedData: result.rows[0]
        })
      );

    } catch (error) {
      console.error('Error in deleteData:', error);
      handleDatabaseError(error, res);
    }
  }

  // GET /api/dynamic-data/table/:tableName - Get data from any table by table name (with variables)
  static async getDataByTableName(req, res) {
    try {
      const { tableName } = req.params;
      const { page = 1, limit = 50, search = '', sortBy = 'id', sortOrder = 'ASC' } = req.query;

      // Check if table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      
      const tableExistsResult = await pool.query(tableExistsQuery, [tableName]);
      
      if (!tableExistsResult.rows[0].exists) {
        return res.status(400).json(
          generateResponse(false, `Data table '${tableName}' does not exist`, 400, null)
        );
      }

      // Get table structure to build dynamic query
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const columnsResult = await pool.query(columnsQuery, [tableName]);
      const columns = columnsResult.rows.map(col => col.column_name);

      // Build search conditions
      let searchConditions = '';
      let searchParams = [];
      
      if (search && search.trim() !== '') {
        const searchableColumns = columns.filter(col => 
          col !== 'id' && 
          columnsResult.rows.find(c => c.column_name === col)?.data_type === 'character varying'
        );
        
        if (searchableColumns.length > 0) {
          const searchClauses = searchableColumns.map((col, index) => 
            `"${col}" ILIKE $${index + 1}`
          );
          searchConditions = `WHERE ${searchClauses.join(' OR ')}`;
          searchParams = searchableColumns.map(() => `%${search}%`);
        }
      }

      // Build sort clause
      const validSortBy = columns.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
      const orderClause = `ORDER BY "${validSortBy}" ${validSortOrder}`;

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM "${tableName}" ${searchConditions}`;
      const countResult = await pool.query(countQuery, searchParams);
      const totalCount = parseInt(countResult.rows[0].count);

      // Calculate pagination
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(totalCount / limit);

      // Get data with pagination
      const dataQuery = `
        SELECT * FROM "${tableName}" 
        ${searchConditions}
        ${orderClause}
        LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
      `;
      
      const dataParams = [...searchParams, limit, offset];
      const dataResult = await pool.query(dataQuery, dataParams);

      const response = {
        tableName: tableName,
        data: dataResult.rows,
        columns: columnsResult.rows.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES'
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

      res.status(200).json(
        generateResponse(true, 'Data retrieved successfully', 200, response)
      );

    } catch (error) {
      console.error('Error in getDataByTableName:', error);
      handleDatabaseError(error, res);
    }
  }
}

module.exports = DynamicDataController;
