const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration with environment variables
const pool = new Pool({
  user: process.env.DB_USER || "admin",
  host: process.env.DB_HOST || "66.175.209.51",
  database: process.env.DB_NAME || "sapb1validator",
  password: process.env.DB_PASSWORD || "Consultare@#890",
  port: process.env.DB_PORT || 5432,
  // Add connection timeout and retry options
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
});

// Test database connection
let dbConnected = false;

pool.on('connect', () => {
  dbConnected = true;
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  dbConnected = false;
  // Don't exit the process, allow fallback to mock data
});

// Test initial connection
pool.query('SELECT NOW()')
  .then(() => {
    dbConnected = true;
  })
  .catch((err) => {
    console.warn('Database connection test failed:', err.message);
    dbConnected = false;
  });

module.exports = {
  pool,
  dbConnected: () => dbConnected
};
