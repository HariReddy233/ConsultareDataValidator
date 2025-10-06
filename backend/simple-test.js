const http = require('http');

const testData = [
  {
    CardCode: 'C001',
    CardName: 'Test Customer',
    CardType: 'cCustomer',
    Phone1: '123-456-7890',
    Email: 'test@example.com'
  },
  {
    CardCode: '', // Empty required field
    CardName: 'Test Customer 2',
    CardType: 'invalid_type', // Invalid type
    Phone1: 'invalid-phone',
    Email: 'invalid-email'
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

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const result = JSON.parse(data);
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\nValidation Summary:');
        console.log(`Total: ${result.summary.total}`);
        console.log(`Valid: ${result.summary.valid}`);
        console.log(`Warnings: ${result.summary.warnings}`);
        console.log(`Errors: ${result.summary.errors}`);
        console.log(`Validation Method: ${result.validationMethod}`);
        
        if (result.aiError) {
          console.log(`\nAI Error: ${result.aiError}`);
        }
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
