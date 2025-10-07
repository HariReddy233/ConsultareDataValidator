require('dotenv').config();
const { pool } = require('./config/database');

async function fixDownloadUrls() {
  try {
    console.log('🔧 Fixing download URLs in database...\n');
    
    // Get all subcategories with SharePoint URLs
    const result = await pool.query(`
      SELECT "SubCategoryID", "SubCategoryName", "TemplatePath", "SamplePath"
      FROM "SAP_SubCategories"
      WHERE "TemplatePath" LIKE '%sharepoint.com%' OR "SamplePath" LIKE '%sharepoint.com%'
    `);
    
    console.log(`Found ${result.rows.length} subcategories with SharePoint URLs`);
    
    for (const row of result.rows) {
      const { SubCategoryID, SubCategoryName, TemplatePath, SamplePath } = row;
      
      console.log(`\n📝 Processing: ${SubCategoryName}`);
      
      let newTemplatePath = TemplatePath;
      let newSamplePath = SamplePath;
      
      // Fix template path - convert to API endpoint
      if (TemplatePath && TemplatePath.includes('sharepoint.com')) {
        newTemplatePath = `/api/categories/download/${SubCategoryID}/template`;
        console.log(`  Template: ${TemplatePath} -> ${newTemplatePath}`);
      }
      
      // Fix sample path - convert to API endpoint
      if (SamplePath && SamplePath.includes('sharepoint.com')) {
        newSamplePath = `/api/categories/download/${SubCategoryID}/sample`;
        console.log(`  Sample: ${SamplePath} -> ${newSamplePath}`);
      }
      
      // Update the database
      await pool.query(`
        UPDATE "SAP_SubCategories"
        SET "TemplatePath" = $1, "SamplePath" = $2
        WHERE "SubCategoryID" = $3
      `, [newTemplatePath, newSamplePath, SubCategoryID]);
      
      console.log(`  ✅ Updated ${SubCategoryName}`);
    }
    
    console.log('\n🎉 All download URLs have been fixed!');
    console.log('\n📋 New API endpoints:');
    console.log('  Template: GET /api/categories/download/{subCategoryId}/template');
    console.log('  Sample:   GET /api/categories/download/{subCategoryId}/sample');
    
  } catch (error) {
    console.error('❌ Error fixing download URLs:', error);
  } finally {
    await pool.end();
  }
}

fixDownloadUrls();
