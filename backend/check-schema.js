const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || '66.175.209.51',
  database: process.env.DB_NAME || 'sapb1validator',
  password: process.env.DB_PASSWORD || 'Consultare@#890',
  port: process.env.DB_PORT || 5432
});

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema for role-based permissions...\n');

    // Check if there's a role_permissions table
    console.log('📋 Checking for role_permissions table:');
    const rolePermissionsCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'role_permissions'
    `);
    
    if (rolePermissionsCheck.rows.length > 0) {
      console.log('✅ role_permissions table exists');
      
      // Show role_permissions data
      const rolePermissionsData = await pool.query(`
        SELECT rp.role_id, r.role_name, rp.module_id, m.module_name,
               rp.can_read, rp.can_create, rp.can_update, rp.can_delete
        FROM role_permissions rp
        JOIN roles r ON rp.role_id = r.role_id
        JOIN modules m ON rp.module_id = m.module_id
        ORDER BY r.role_name, m.module_name
      `);
      console.log('\n📊 Role permissions data:');
      console.table(rolePermissionsData.rows);
    } else {
      console.log('❌ role_permissions table does NOT exist');
    }

    // Check current user_permissions structure
    console.log('\n📋 Current user_permissions structure:');
    const userPermissionsSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_permissions'
      ORDER BY ordinal_position
    `);
    console.table(userPermissionsSchema.rows);

    // Check if we should have role-based permissions
    console.log('\n🤔 Analysis:');
    console.log('Current system uses user_permissions table');
    console.log('This means permissions are stored per USER, not per ROLE');
    console.log('\nFor ROLE-based permissions, we would need:');
    console.log('1. role_permissions table (role_id, module_id, permissions)');
    console.log('2. Users inherit permissions from their assigned role');
    console.log('3. When you change role permissions, all users with that role get updated');

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();
