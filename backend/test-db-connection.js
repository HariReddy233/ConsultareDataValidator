const { Pool } = require('pg');

// Test database connection with the new password
const pool = new Pool({
  user: "admin",
  host: "66.175.209.51",
  database: "sapb1validator",
  password: "Consultare@#890",
  port: 5432,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
});

console.log('Testing database connection...');
console.log('Host: 66.175.209.51');
console.log('Port: 5432');
console.log('Database: sapb1validator');
console.log('User: admin');
console.log('Password: Consultare@#890');
console.log('');

pool.query('SELECT NOW()')
  .then((result) => {
    console.log('✅ Database connection successful!');
    console.log('Current time from database:', result.rows[0].now);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Database connection failed:');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });
