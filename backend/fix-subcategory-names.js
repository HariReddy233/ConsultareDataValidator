require('dotenv').config();
const { pool } = require('./config/database');

async function fixSubCategoryNames() {
  try {
    console.log('🔧 Fixing SubCategoryName entries to remove spaces...\n');
    
    // Update all SubCategoryName entries to remove spaces
    const updates = [
      { old: 'Tax Info', new: 'TaxInfo' },
      { old: 'Contact Person', new: 'ContactPerson' },
      { old: 'State Code', new: 'StateCode' },
      { old: 'Group Code', new: 'GroupCode' },
      { old: 'Item Details', new: 'ItemDetails' },
      { old: 'Chart of Accounts', new: 'ChartOfAccounts' },
      { old: 'GL Accounts', new: 'GLAccounts' },
      { old: 'Cost Centers', new: 'CostCenters' },
      { old: 'Profit Centers', new: 'ProfitCenters' },
      { old: 'Company Settings', new: 'CompanySettings' },
      { old: 'User Management', new: 'UserManagement' },
      { old: 'System Configuration', new: 'SystemConfiguration' },
      { old: 'Integration Settings', new: 'IntegrationSettings' }
    ];
    
    for (const update of updates) {
      console.log(`📝 Updating "${update.old}" to "${update.new}"`);
      
      const result = await pool.query(`
        UPDATE "SAP_SubCategories" 
        SET "SubCategoryName" = $1 
        WHERE "SubCategoryName" = $2
      `, [update.new, update.old]);
      
      if (result.rowCount > 0) {
        console.log(`✅ Updated ${result.rowCount} record(s)`);
      } else {
        console.log(`⚠️  No records found for "${update.old}"`);
      }
    }
    
    console.log('\n🔍 Verifying all SubCategoryName entries...\n');
    
    // Verify all entries
    const result = await pool.query(`
      SELECT "SubCategoryID", "SubCategoryName", "Data_Table" 
      FROM "SAP_SubCategories" 
      ORDER BY "SubCategoryID"
    `);
    
    console.table(result.rows);
    
    // Check for any remaining spaces
    const spacesResult = await pool.query(`
      SELECT "SubCategoryName" 
      FROM "SAP_SubCategories" 
      WHERE "SubCategoryName" LIKE '% %'
    `);
    
    if (spacesResult.rows.length === 0) {
      console.log('\n🎉 All SubCategoryName entries are now without spaces!');
      console.log('✅ You can now use clean URLs without URL encoding.');
    } else {
      console.log('\n⚠️  Some entries still have spaces:');
      console.table(spacesResult.rows);
    }
    
  } catch (error) {
    console.error('❌ Error fixing SubCategoryName entries:', error);
  } finally {
    await pool.end();
  }
}

fixSubCategoryNames();
