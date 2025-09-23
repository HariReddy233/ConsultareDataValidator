const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER || "admin",
  host: process.env.DB_HOST || "66.175.209.51",
  database: process.env.DB_NAME || "sapb1validator",
  password: process.env.DB_PASSWORD || "Chung@2024",
  port: process.env.DB_PORT || 5432,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
});

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log(`Host: ${process.env.DB_HOST || '66.175.209.51'}`);
  console.log(`Port: ${process.env.DB_PORT || 5432}`);
  console.log(`Database: ${process.env.DB_NAME || 'sapb1validator'}`);
  console.log(`User: ${process.env.DB_USER || 'admin'}`);
  console.log('');

  try {
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log(`Current time from DB: ${result.rows[0].current_time}`);
    
    // Test if required tables exist
    console.log('\n🔍 Checking for required tables...');
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name ILIKE '%instruction%' OR table_name ILIKE '%item%')
      ORDER BY table_name
    `);
    
    console.log('Available tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Test specific table queries
    console.log('\n🔍 Testing table queries...');
    
    // Test sap_bpmaster_instructions table
    try {
      const bpResult = await pool.query('SELECT COUNT(*) as count FROM "sap_bpmaster_instructions"');
      console.log(`✅ sap_bpmaster_instructions table: ${bpResult.rows[0].count} records`);
    } catch (err) {
      console.log(`❌ sap_bpmaster_instructions table: ${err.message}`);
    }
    
    // Test Item_field_instructions table
    try {
      const itemResult = await pool.query('SELECT COUNT(*) as count FROM "Item_field_instructions"');
      console.log(`✅ Item_field_instructions table: ${itemResult.rows[0].count} records`);
    } catch (err) {
      console.log(`❌ Item_field_instructions table: ${err.message}`);
    }
    
  } catch (err) {
    console.log('❌ Database connection failed!');
    console.log(`Error: ${err.message}`);
    console.log(`Code: ${err.code}`);
    
    if (err.code === 'ECONNREFUSED') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if PostgreSQL server is running on the remote host');
      console.log('2. Verify the host IP address and port are correct');
      console.log('3. Check firewall settings on the remote server');
      console.log('4. Ensure PostgreSQL is configured to accept remote connections');
      console.log('5. Verify the database credentials are correct');
    } else if (err.code === 'ENOTFOUND') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if the hostname/IP address is correct');
      console.log('2. Verify network connectivity to the server');
    } else if (err.code === '28P01') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if the username and password are correct');
      console.log('2. Verify the user has access to the database');
    } else if (err.code === '3D000') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if the database name is correct');
      console.log('2. Verify the database exists on the server');
    }
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection().catch(console.error);
