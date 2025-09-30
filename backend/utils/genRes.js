/**
 * Generate standardized API response
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {number} statusCode - HTTP status code
 * @param {any} data - Response data
 * @returns {object} Standardized response object
 */
const generateResponse = (success, message, statusCode, data = null) => {
  return {
    success,
    message,
    statusCode,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Generate success response
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {object} Success response
 */
const successResponse = (message, data = null, statusCode = 200) => {
  return generateResponse(true, message, statusCode, data);
};

/**
 * Generate error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {any} data - Error data
 * @returns {object} Error response
 */
const errorResponse = (message, statusCode = 400, data = null) => {
  return generateResponse(false, message, statusCode, data);
};

/**
 * Generate validation error response
 * @param {string} message - Validation error message
 * @param {any} errors - Validation errors
 * @returns {object} Validation error response
 */
const validationErrorResponse = (message, errors) => {
  return generateResponse(false, message, 422, { errors });
};

/**
 * Generate not found response
 * @param {string} message - Not found message
 * @returns {object} Not found response
 */
const notFoundResponse = (message = 'Resource not found') => {
  return generateResponse(false, message, 404);
};

/**
 * Generate unauthorized response
 * @param {string} message - Unauthorized message
 * @returns {object} Unauthorized response
 */
const unauthorizedResponse = (message = 'Unauthorized access') => {
  return generateResponse(false, message, 401);
};

/**
 * Generate forbidden response
 * @param {string} message - Forbidden message
 * @returns {object} Forbidden response
 */
const forbiddenResponse = (message = 'Access forbidden') => {
  return generateResponse(false, message, 403);
};

/**
 * Generate internal server error response
 * @param {string} message - Error message
 * @returns {object} Internal server error response
 */
const internalServerErrorResponse = (message = 'Internal server error') => {
  return generateResponse(false, message, 500);
};

module.exports = {
  generateResponse,
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  internalServerErrorResponse
};
