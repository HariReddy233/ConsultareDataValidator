const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin',
  host: '66.175.209.51',
  database: 'sapb1validator',
  password: 'Consultare@#890',
  port: 5432,
});

async function checkAndCleanDatabase() {
  try {
    console.log('=== DATABASE CLEANUP DEBUG ===');
    
    // Check what tables exist
    console.log('Checking existing tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%Code%' OR table_name LIKE '%State%'
      ORDER BY table_name
    `);
    console.log('Tables with Code or State in name:', tablesResult.rows);
    
    // Check State Code table specifically
    console.log('\nChecking State Code table...');
    const stateCodeExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'State Code'
      )
    `);
    console.log('State Code table exists:', stateCodeExists.rows[0].exists);
    
    if (stateCodeExists.rows[0].exists) {
      console.log('\nChecking State Code table structure...');
      const columnsResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'State Code' 
        ORDER BY ordinal_position
      `);
      console.log('State Code columns:', columnsResult.rows);
      
      console.log('\nChecking State Code table data...');
      const dataResult = await pool.query('SELECT * FROM "State Code" LIMIT 3');
      console.log('State Code data (first 3 rows):', dataResult.rows);
      
      console.log('\nDropping State Code table completely...');
      await pool.query('DROP TABLE IF EXISTS "State Code" CASCADE');
      console.log('State Code table dropped successfully');
      
      // Verify it's gone
      const stillExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'State Code'
        )
      `);
      console.log('State Code table still exists after drop:', stillExists.rows[0].exists);
    }
    
    // Check for any other problematic tables
    console.log('\nChecking for other tables that might cause conflicts...');
    const allTablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('All tables in database:', allTablesResult.rows.map(r => r.table_name));
    
    console.log('\n=== DATABASE CLEANUP COMPLETE ===');
    
  } catch (error) {
    console.error('Error during database cleanup:', error);
  } finally {
    await pool.end();
  }
}

checkAndCleanDatabase();
