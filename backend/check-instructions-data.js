require('dotenv').config();
const { pool } = require('./config/database');

async function checkInstructionsData() {
  try {
    console.log('🔍 Checking data in sap_bpmaster_instructions table...\n');
    
    // Check sap_bpmaster_instructions table
    const instructionsResult = await pool.query(`
      SELECT COUNT(*) as count, table_name 
      FROM sap_bpmaster_instructions 
      GROUP BY table_name 
      ORDER BY table_name
    `);
    
    console.log('📊 Data in sap_bpmaster_instructions table:');
    console.table(instructionsResult.rows);
    
    console.log('\n🔍 Checking data in GeneralInfo table...\n');
    
    // Check GeneralInfo table
    const generalInfoResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM "GeneralInfo"
    `);
    
    console.log(`📊 GeneralInfo table has ${generalInfoResult.rows[0].count} rows`);
    
    // Get sample data from GeneralInfo
    const sampleResult = await pool.query(`
      SELECT "SAPFields", "DataBaseField", "Description", "DataType", "FieldLength", "Mandatory"
      FROM "GeneralInfo" 
      LIMIT 5
    `);
    
    console.log('\n📋 Sample data from GeneralInfo table:');
    console.table(sampleResult.rows);
    
    console.log('\n🔍 Checking if we need to migrate data...\n');
    
    // Check if GeneralInfo data exists in sap_bpmaster_instructions
    const generalInfoInstructions = await pool.query(`
      SELECT COUNT(*) as count 
      FROM sap_bpmaster_instructions 
      WHERE table_name = 'GeneralInfo'
    `);
    
    console.log(`📊 sap_bpmaster_instructions has ${generalInfoInstructions.rows[0].count} rows for GeneralInfo`);
    
    if (parseInt(generalInfoInstructions.rows[0].count) === 0) {
      console.log('⚠️  No data found in sap_bpmaster_instructions for GeneralInfo');
      console.log('💡 We need to migrate data from GeneralInfo table to sap_bpmaster_instructions');
    } else {
      console.log('✅ Data exists in sap_bpmaster_instructions for GeneralInfo');
    }
    
  } catch (error) {
    console.error('❌ Error checking instructions data:', error);
  } finally {
    await pool.end();
  }
}

checkInstructionsData();
