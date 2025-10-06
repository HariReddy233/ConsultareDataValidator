const http = require('http');

// Test data with various validation scenarios
const testData = [
  {
    CardCode: 'C001',
    CardName: 'Valid Customer Ltd',
    CardType: 'cCustomer',
    Phone1: '123-456-7890',
    Email: 'valid@example.com',
    GroupCode: '1'
  },
  {
    CardCode: '', // Empty required field - should be ERROR
    CardName: 'Customer Without Code',
    CardType: 'cCustomer',
    Phone1: '987-654-3210',
    Email: 'customer@example.com'
  },
  {
    CardCode: 'C003',
    CardName: 'Customer with Invalid Type',
    CardType: 'invalid_type', // Invalid type - should be ERROR
    Phone1: '555-123-4567',
    Email: 'invalid-type@example.com'
  },
  {
    CardCode: 'C004',
    CardName: 'Customer with Bad Email', // Warning for invalid email
    CardType: 'cSupplier',
    Phone1: '555-987-6543',
    Email: 'not-an-email' // Invalid email format - should be WARNING
  },
  {
    CardCode: 'C005',
    CardName: 'A', // Very short name - might be WARNING
    CardType: 'cCustomer',
    Phone1: '555-111-2222',
    Email: 'short@example.com'
  }
];

const postData = JSON.stringify({ data: testData });

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/validate/BusinessPartnerMasterData',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing AI Validation with GPT-4o...');
console.log('Test data includes:');
console.log('- Valid record (should be Valid)');
console.log('- Empty required field (should be Error)');
console.log('- Invalid field value (should be Error)');
console.log('- Invalid email format (should be Warning)');
console.log('- Very short name (should be Warning)');
console.log('\nSending request...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received!\n');
    try {
      const result = JSON.parse(data);
      
      console.log('=== VALIDATION RESULTS ===');
      console.log(`Success: ${result.success}`);
      console.log(`Category: ${result.category}`);
      console.log(`Validation Method: ${result.validationMethod}`);
      
      if (result.aiError) {
        console.log(`\nAI Error: ${result.aiError}`);
      }
      
      if (result.aiRecommendations) {
        console.log(`\nAI Recommendations: ${result.aiRecommendations}`);
      }
      
      console.log('\n=== SUMMARY ===');
      if (result.summary) {
        console.log(`Total Records: ${result.summary.total}`);
        console.log(`Valid: ${result.summary.valid}`);
        console.log(`Warnings: ${result.summary.warnings}`);
        console.log(`Errors: ${result.summary.errors}`);
      }
      
      console.log('\n=== INDIVIDUAL RESULTS ===');
      if (result.results && Array.isArray(result.results)) {
        result.results.forEach((row, index) => {
          console.log(`\nRow ${row.rowNumber} (${row.code}):`);
          console.log(`  Status: ${row.status}`);
          console.log(`  Message: ${row.message}`);
          
          if (row.fieldsWithIssues && row.fieldsWithIssues.length > 0) {
            console.log(`  Fields with Issues: ${row.fieldsWithIssues.join(', ')}`);
          }
          
          if (row.aiInsights) {
            console.log(`  AI Insights: ${row.aiInsights}`);
          }
        });
      }
      
      // Check if we got different statuses
      const statuses = result.results ? result.results.map(r => r.status) : [];
      const uniqueStatuses = [...new Set(statuses)];
      console.log(`\nUnique Statuses Found: ${uniqueStatuses.join(', ')}`);
      
      if (uniqueStatuses.includes('Error') && uniqueStatuses.includes('Warning') && uniqueStatuses.includes('Valid')) {
        console.log('\n✅ SUCCESS: AI validation is working with Valid, Warning, and Error statuses!');
      } else if (uniqueStatuses.includes('Error') || uniqueStatuses.includes('Warning')) {
        console.log('\n⚠️  PARTIAL: Some validation statuses detected, but not all three types.');
      } else {
        console.log('\n❌ ISSUE: Only basic validation is working. Check OpenAI API key configuration.');
      }
      
    } catch (e) {
      console.log('Error parsing response:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
