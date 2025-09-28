const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER || "admin",
  host: process.env.DB_HOST || "66.175.209.51",
  database: process.env.DB_NAME || "sapb1validator",
  password: process.env.DB_PASSWORD || "Consultare@#890",
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create_sap_categories_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 Created tables:');
    console.log('   - SAP_MainCategories');
    console.log('   - SAP_SubCategories');
    console.log('📝 Inserted sample data for 4 main categories and their subcategories');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration();
