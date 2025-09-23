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

async function fixPermissions() {
  console.log('🔧 Attempting to fix database permissions...');
  
  try {
    // Test connection first
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Try to grant permissions
    const tables = ['sap_bpmaster_instructions', 'item_field_instructions', 'item_master_data'];
    
    for (const table of tables) {
      try {
        console.log(`\n🔧 Granting permissions on table: ${table}`);
        
        // Grant SELECT permission
        await pool.query(`GRANT SELECT ON TABLE "${table}" TO admin`);
        console.log(`✅ SELECT permission granted on ${table}`);
        
        // Grant USAGE on sequence if it exists
        try {
          await pool.query(`GRANT USAGE ON SEQUENCE "${table}_id_seq" TO admin`);
          console.log(`✅ USAGE permission granted on ${table}_id_seq`);
        } catch (seqErr) {
          console.log(`ℹ️  No sequence found for ${table} (this is normal)`);
        }
        
      } catch (err) {
        console.log(`❌ Failed to grant permissions on ${table}: ${err.message}`);
      }
    }
    
    // Test if we can now query the tables
    console.log('\n🧪 Testing table access...');
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`✅ ${table}: ${result.rows[0].count} records accessible`);
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
    
    if (err.code === '42501') {
      console.log('\n💡 The admin user does not have sufficient privileges to grant permissions.');
      console.log('You need to connect as a superuser (like postgres) to grant permissions.');
      console.log('\nTry running these commands as postgres user:');
      console.log('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;');
      console.log('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;');
    }
  } finally {
    await pool.end();
  }
}

// Run the fix
fixPermissions().catch(console.error);
