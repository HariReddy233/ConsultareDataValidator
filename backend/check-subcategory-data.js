require('dotenv').config();
const { pool } = require('./config/database');

async function checkSubCategoryData() {
  try {
    console.log('🔍 Checking SAP_SubCategories data...\n');
    
    // Get all subcategories with their data tables
    const result = await pool.query(`
      SELECT 
        sc."SubCategoryID",
        sc."SubCategoryName",
        sc."Data_Table",
        mc."MainCategoryName"
      FROM "SAP_SubCategories" sc
      JOIN "SAP_MainCategories" mc ON sc."MainCategoryID" = mc."MainCategoryID"
      ORDER BY sc."SubCategoryID"
    `);
    
    console.log('📊 SAP_SubCategories Data:');
    console.table(result.rows);
    
    console.log('\n🔍 Checking which tables actually exist in database...\n');
    
    // Check which Data_Table values actually exist as tables
    for (const row of result.rows) {
      const tableName = row.Data_Table;
      if (tableName) {
        const tableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [tableName]);
        
        console.log(`${tableExists.rows[0].exists ? '✅' : '❌'} ${row.SubCategoryName} -> ${tableName} (${tableExists.rows[0].exists ? 'EXISTS' : 'NOT FOUND'})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkSubCategoryData();
