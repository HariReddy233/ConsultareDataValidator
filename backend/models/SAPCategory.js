const { pool } = require('../config/database');

class SAPCategory {
  // Get all main categories with their subcategories
  static async getAllCategoriesWithSubcategories() {
    const result = await pool.query(`
      SELECT 
        mc."MainCategoryID",
        mc."MainCategoryName",
        sc."SubCategoryID",
        sc."SubCategoryName",
        sc."TemplatePath",
        sc."SamplePath",
        sc."Data_Table"
      FROM "SAP_MainCategories" mc
      LEFT JOIN "SAP_SubCategories" sc ON mc."MainCategoryID" = sc."MainCategoryID"
      ORDER BY mc."MainCategoryID", sc."SubCategoryID"
    `);
    
    // Group the results by main category
    const categoriesMap = new Map();
    
    result.rows.forEach(row => {
      const mainCategoryId = row.MainCategoryID;
      
      if (!categoriesMap.has(mainCategoryId)) {
        categoriesMap.set(mainCategoryId, {
          MainCategoryID: row.MainCategoryID,
          MainCategoryName: row.MainCategoryName,
          SubCategories: []
        });
      }
      
      // Only add subcategory if it exists (LEFT JOIN might return null)
      if (row.SubCategoryID) {
        categoriesMap.get(mainCategoryId).SubCategories.push({
          SubCategoryID: row.SubCategoryID,
          SubCategoryName: row.SubCategoryName,
          TemplatePath: row.TemplatePath,
          SamplePath: row.SamplePath,
          Data_Table: row.Data_Table
        });
      }
    });
    
    return Array.from(categoriesMap.values());
  }

  // Get main categories only
  static async getMainCategories() {
    const result = await pool.query(`
      SELECT "MainCategoryID", "MainCategoryName"
      FROM "SAP_MainCategories"
      ORDER BY "MainCategoryID"
    `);
    return result.rows;
  }

  // Get subcategories by main category ID
  static async getSubcategoriesByMainCategoryId(mainCategoryId) {
    const result = await pool.query(`
      SELECT 
        "SubCategoryID",
        "SubCategoryName",
        "TemplatePath",
        "SamplePath",
        "Data_Table"
      FROM "SAP_SubCategories"
      WHERE "MainCategoryID" = $1
      ORDER BY "SubCategoryID"
    `, [mainCategoryId]);
    return result.rows;
  }

  // Get subcategories by main category name
  static async getSubcategoriesByMainCategoryName(mainCategoryName) {
    const result = await pool.query(`
      SELECT 
        sc."SubCategoryID",
        sc."SubCategoryName",
        sc."TemplatePath",
        sc."SamplePath",
        sc."Data_Table"
      FROM "SAP_SubCategories" sc
      JOIN "SAP_MainCategories" mc ON sc."MainCategoryID" = mc."MainCategoryID"
      WHERE mc."MainCategoryName" = $1
      ORDER BY sc."SubCategoryID"
    `, [mainCategoryName]);
    return result.rows;
  }

  // Get file path for template or sample
  static async getFilePath(subCategoryId, fileType) {
    const column = fileType === 'template' ? 'TemplatePath' : 'SamplePath';
    const result = await pool.query(`
      SELECT "${column}" as file_path
      FROM "SAP_SubCategories"
      WHERE "SubCategoryID" = $1
    `, [subCategoryId]);
    
    return result.rows[0]?.file_path || null;
  }

  // Create new main category
  static async createMainCategory(categoryName) {
    const result = await pool.query(`
      INSERT INTO "SAP_MainCategories" ("MainCategoryName")
      VALUES ($1)
      RETURNING *
    `, [categoryName]);
    return result.rows[0];
  }

  // Create new subcategory
  static async createSubcategory(mainCategoryId, subCategoryName, templatePath = null, samplePath = null) {
    const result = await pool.query(`
      INSERT INTO "SAP_SubCategories" ("MainCategoryID", "SubCategoryName", "TemplatePath", "SamplePath")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [mainCategoryId, subCategoryName, templatePath, samplePath]);
    return result.rows[0];
  }

  // Update subcategory file paths
  static async updateSubcategoryPaths(subCategoryId, templatePath = null, samplePath = null) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (templatePath !== null) {
      updates.push(`"TemplatePath" = $${paramCount}`);
      values.push(templatePath);
      paramCount++;
    }

    if (samplePath !== null) {
      updates.push(`"SamplePath" = $${paramCount}`);
      values.push(samplePath);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(subCategoryId);
    const query = `
      UPDATE "SAP_SubCategories" 
      SET ${updates.join(', ')}
      WHERE "SubCategoryID" = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = SAPCategory;
