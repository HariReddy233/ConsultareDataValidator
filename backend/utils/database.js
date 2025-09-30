const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || '66.175.209.51',
  database: process.env.DB_NAME || 'sapb1validator',
  password: process.env.DB_PASSWORD || 'Consultare@#890',
  port: process.env.DB_PORT || 5432,
});

// Generic function to execute queries with automatic connection management
const withClient = async (callback) => {
  const client = await pool.connect();
  try {
    return await callback(client);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  withClient,
  testConnection
};
