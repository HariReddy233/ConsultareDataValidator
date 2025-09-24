// Helper function to handle database errors
const handleDatabaseError = (err, res) => {
  console.error('Database error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
};

// Helper function to handle database connection errors
const handleConnectionError = (res, host, port, database) => {
  res.status(503).json({
    error: 'Database connection failed',
    message: 'Cannot connect to database server. Please check if PostgreSQL is running and accessible.',
    details: {
      host: host || '66.175.209.51',
      port: port || 5432,
      database: database || 'sapb1validator',
      errorCode: 'ECONNREFUSED'
    }
  });
};

module.exports = {
  handleDatabaseError,
  handleConnectionError
};
