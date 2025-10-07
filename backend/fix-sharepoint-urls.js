require('dotenv').config();
const { pool } = require('./config/database');

async function fixSharePointUrls() {
  try {
    console.log('🔧 Fixing SharePoint URLs in database...\n');
    
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
      
      // Fix template path
      if (TemplatePath && TemplatePath.includes('sharepoint.com')) {
        // Convert SharePoint URL to direct download URL
        newTemplatePath = convertToDirectDownloadUrl(TemplatePath, 'template');
        console.log(`  Template: ${TemplatePath} -> ${newTemplatePath}`);
      }
      
      // Fix sample path
      if (SamplePath && SamplePath.includes('sharepoint.com')) {
        // Convert SharePoint URL to direct download URL
        newSamplePath = convertToDirectDownloadUrl(SamplePath, 'sample');
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
    
    console.log('\n🎉 All SharePoint URLs have been fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing SharePoint URLs:', error);
  } finally {
    await pool.end();
  }
}

function convertToDirectDownloadUrl(sharePointUrl, fileType) {
  try {
    // Extract the file name from the URL
    const fileName = extractFileName(sharePointUrl);
    
    // For now, we'll create a placeholder URL that the API can handle
    // In a real implementation, you would need to:
    // 1. Use Microsoft Graph API to get a proper download URL
    // 2. Or convert to a direct download link format
    
    // Create a special URL that our API can recognize and handle
    return `sharepoint://${fileType}/${fileName}`;
    
  } catch (error) {
    console.error('Error converting URL:', error);
    return sharePointUrl; // Return original if conversion fails
  }
}

function extractFileName(url) {
  // Extract filename from SharePoint URL
  const match = url.match(/\/([^\/]+\.xlsx)/);
  return match ? match[1] : 'file.xlsx';
}

fixSharePointUrls();
