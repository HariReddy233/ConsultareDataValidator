const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER || "admin",
  host: process.env.DB_HOST || "66.175.209.51",
  database: process.env.DB_NAME || "sapb1validator",
  password: process.env.DB_PASSWORD || "Consultare@#890",
  port: process.env.DB_PORT || 5432,
});

async function testCategoriesAPI() {
  try {
    console.log('🧪 Testing SAP Categories API...\n');
    
    // Test 1: Check if tables exist
    console.log('1. Checking if tables exist...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('SAP_MainCategories', 'SAP_SubCategories')
      ORDER BY table_name
    `);
    
    console.log(`   ✅ Found ${tablesResult.rows.length} tables:`, tablesResult.rows.map(r => r.table_name));
    
    // Test 2: Check main categories
    console.log('\n2. Checking main categories...');
    const mainCategoriesResult = await pool.query('SELECT * FROM "SAP_MainCategories" ORDER BY "MainCategoryID"');
    console.log(`   ✅ Found ${mainCategoriesResult.rows.length} main categories:`);
    mainCategoriesResult.rows.forEach(cat => {
      console.log(`      - ${cat.MainCategoryID}: ${cat.MainCategoryName}`);
    });
    
    // Test 3: Check subcategories
    console.log('\n3. Checking subcategories...');
    const subCategoriesResult = await pool.query(`
      SELECT 
        sc."SubCategoryID",
        sc."SubCategoryName",
        mc."MainCategoryName"
      FROM "SAP_SubCategories" sc
      JOIN "SAP_MainCategories" mc ON sc."MainCategoryID" = mc."MainCategoryID"
      ORDER BY mc."MainCategoryID", sc."SubCategoryID"
    `);
    console.log(`   ✅ Found ${subCategoriesResult.rows.length} subcategories:`);
    subCategoriesResult.rows.forEach(sub => {
      console.log(`      - ${sub.MainCategoryName}: ${sub.SubCategoryName}`);
    });
    
    // Test 4: Test the nested query (same as API endpoint)
    console.log('\n4. Testing nested query (API endpoint logic)...');
    const nestedResult = await pool.query(`
      SELECT 
        mc."MainCategoryID",
        mc."MainCategoryName",
        sc."SubCategoryID",
        sc."SubCategoryName",
        sc."TemplatePath",
        sc."SamplePath"
      FROM "SAP_MainCategories" mc
      LEFT JOIN "SAP_SubCategories" sc ON mc."MainCategoryID" = sc."MainCategoryID"
      ORDER BY mc."MainCategoryID", sc."SubCategoryID"
    `);
    
    // Group the results by main category
    const categoriesMap = new Map();
    nestedResult.rows.forEach(row => {
      const mainCategoryId = row.MainCategoryID;
      
      if (!categoriesMap.has(mainCategoryId)) {
        categoriesMap.set(mainCategoryId, {
          MainCategoryID: row.MainCategoryID,
          MainCategoryName: row.MainCategoryName,
          SubCategories: []
        });
      }
      
      if (row.SubCategoryID) {
        categoriesMap.get(mainCategoryId).SubCategories.push({
          SubCategoryID: row.SubCategoryID,
          SubCategoryName: row.SubCategoryName,
          TemplatePath: row.TemplatePath,
          SamplePath: row.SamplePath
        });
      }
    });
    
    const categories = Array.from(categoriesMap.values());
    console.log(`   ✅ Generated ${categories.length} main categories with subcategories:`);
    categories.forEach(cat => {
      console.log(`      - ${cat.MainCategoryName} (${cat.SubCategories.length} subcategories)`);
    });
    
    // Test 5: Test file path queries
    console.log('\n5. Testing file path queries...');
    const filePathResult = await pool.query(`
      SELECT "SubCategoryID", "SubCategoryName", "TemplatePath", "SamplePath"
      FROM "SAP_SubCategories"
      WHERE "TemplatePath" IS NOT NULL OR "SamplePath" IS NOT NULL
      LIMIT 3
    `);
    console.log(`   ✅ Found ${filePathResult.rows.length} subcategories with file paths:`);
    filePathResult.rows.forEach(sub => {
      console.log(`      - ${sub.SubCategoryName}:`);
      if (sub.TemplatePath) console.log(`        Template: ${sub.TemplatePath}`);
      if (sub.SamplePath) console.log(`        Sample: ${sub.SamplePath}`);
    });
    
    console.log('\n🎉 All tests passed! The SAP Categories API is ready to use.');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Test the API endpoint: GET http://localhost:3000/api/categories');
    console.log('   3. Start the frontend: cd ../frontend && npm start');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Make sure PostgreSQL is running');
    console.error('   2. Check database connection parameters');
    console.error('   3. Run the migration: node run-migration.js');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the test
testCategoriesAPI();
