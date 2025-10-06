const excelService = require('./services/excelService');
const fs = require('fs');

// Test with your actual Excel data structure
async function testRealExcelUpload() {
  try {
    console.log('Testing real Excel upload with new data...');
    
    // Create test data that should replace the current data
    const newTestData = [
      ['Field', 'Field Length', 'Mandatory', 'Explanation'],
      ['NewField1', '50', 'Y', 'This is a new field 1'],
      ['NewField2', '75', 'N', 'This is a new field 2'],
      ['NewField3', '25', 'Y', 'This is a new field 3']
    ];
    
    // Convert to Excel buffer
    const XLSX = require('xlsx');
    const ws = XLSX.utils.aoa_to_sheet(newTestData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Create a mock file object
    const mockFile = {
      buffer: excelBuffer,
      originalname: 'new-test-data.xlsx',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    
    console.log('Uploading new data to replace existing data...');
    
    // Test the upload
    const result = await excelService.processExcelSchema(
      mockFile, 
      'Business Partner Master Data', 
      'Groups'
    );
    
    console.log('✅ Upload result:', result);
    
    // Check what's in the database now
    console.log('\nChecking database after upload...');
    const { pool } = require('./config/database');
    const query = `SELECT * FROM "Groups" ORDER BY id`;
    const dbResult = await pool.query(query);
    console.log('Database after upload:');
    console.log(JSON.stringify(dbResult.rows, null, 2));
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRealExcelUpload();
