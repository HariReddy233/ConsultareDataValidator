require('dotenv').config();
const { pool } = require('./config/database');

async function checkFilePaths() {
  try {
    console.log('🔍 Checking file paths in SAP_SubCategories table...\n');
    
    const result = await pool.query(`
      SELECT 
        "SubCategoryID",
        "SubCategoryName",
        "TemplatePath",
        "SamplePath"
      FROM "SAP_SubCategories"
      ORDER BY "SubCategoryID"
    `);
    
    console.log('📊 Current file paths:');
    console.table(result.rows);
    
    // Check for problematic URLs
    const problematicPaths = result.rows.filter(row => 
      row.TemplatePath && row.TemplatePath.includes('sharepoint.com') ||
      row.SamplePath && row.SamplePath.includes('sharepoint.com')
    );
    
    if (problematicPaths.length > 0) {
      console.log('\n⚠️  Found problematic SharePoint URLs:');
      problematicPaths.forEach(row => {
        console.log(`SubCategory: ${row.SubCategoryName}`);
        if (row.TemplatePath && row.TemplatePath.includes('sharepoint.com')) {
          console.log(`  Template: ${row.TemplatePath}`);
        }
        if (row.SamplePath && row.SamplePath.includes('sharepoint.com')) {
          console.log(`  Sample: ${row.SamplePath}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking file paths:', error);
  } finally {
    await pool.end();
  }
}

checkFilePaths();
