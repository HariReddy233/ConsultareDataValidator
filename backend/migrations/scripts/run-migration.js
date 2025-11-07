const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || "admin",
  host: process.env.DB_HOST || "66.175.209.51",
  database: process.env.DB_NAME || "sapb1validator",
  password: process.env.DB_PASSWORD || "Consultare@#890",
  port: process.env.DB_PORT || 5432,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
});

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create_auth_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Database migration completed successfully!');
    console.log('📋 Created tables:');
    console.log('   - users (authentication)');
    console.log('   - roles (user roles)');
    console.log('   - departments (user departments)');
    console.log('   - modules (permission modules)');
    console.log('   - user_permissions (user access control)');
    console.log('');
    console.log('👤 Default admin user created:');
    console.log('   Email: admin@consultare.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  Please change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
