require('dotenv').config();
const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runFixMigration() {
  try {
    console.log('🔧 Running SubCategory name fix migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'fix_subcategory_names.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the changes
    const result = await pool.query(`
      SELECT "SubCategoryID", "SubCategoryName", "Data_Table" 
      FROM "SAP_SubCategories" 
      ORDER BY "SubCategoryID"
    `);
    
    console.log('\n📊 Updated SubCategory data:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runFixMigration();
