const { dbConnected } = require('../config/database');
const { handleConnectionError } = require('../utils/errorHandler');

// Middleware to check database connection
const checkDatabaseConnection = (req, res, next) => {
  if (!dbConnected()) {
    return handleConnectionError(
      res, 
      process.env.DB_HOST, 
      process.env.DB_PORT, 
      process.env.DB_NAME
    );
  }
  next();
};

module.exports = { checkDatabaseConnection };
