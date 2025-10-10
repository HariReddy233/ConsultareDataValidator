const authService = require('../services/authService');
const { generateResponse } = require('../utils/genRes');

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json(
        generateResponse(false, 'Access denied. No token provided.', 401, null)
      );
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json(
        generateResponse(false, 'Access denied. No token provided.', 401, null)
      );
    }

    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Get user from database to ensure they still exist and are active
    const user = await authService.findUserById(decoded.user_id);
    
    if (!user) {
      return res.status(401).json(
        generateResponse(false, 'Access denied. User not found.', 401, null)
      );
    }

    if (!user.is_active) {
      return res.status(401).json(
        generateResponse(false, 'Access denied. Account is deactivated.', 401, null)
      );
    }

    // Add user info to request object
    req.user = {
      user_id: user.user_id,
      user_email: user.user_email,
      user_role: user.user_role,
      user_department: user.user_department,
      user_name: user.user_name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        generateResponse(false, 'Access denied. Invalid token.', 401, null)
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        generateResponse(false, 'Access denied. Token expired.', 401, null)
      );
    }

    return res.status(401).json(
      generateResponse(false, 'Access denied. Invalid token.', 401, null)
    );
  }
};

// Middleware to check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        generateResponse(false, 'Access denied. User not authenticated.', 401, null)
      );
    }

    if (!roles.includes(req.user.user_role)) {
      return res.status(403).json(
        generateResponse(false, 'Access denied. Insufficient permissions.', 403, null)
      );
    }

    next();
  };
};

// Middleware to check if user has permission for specific module
const checkPermission = (moduleName, permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(
          generateResponse(false, 'Access denied. User not authenticated.', 401, null)
        );
      }

      // Get user permissions
      const permissions = await authService.getUserPermissions(req.user.user_id);
      
      // Find permission for the specific module
      const modulePermission = permissions.find(p => p.module_name === moduleName);
      
      if (!modulePermission) {
        return res.status(403).json(
          generateResponse(false, `Access denied. No permission for ${moduleName}.`, 403, null)
        );
      }

      // Check specific permission
      if (!modulePermission[permission]) {
        return res.status(403).json(
          generateResponse(false, `Access denied. No ${permission} permission for ${moduleName}.`, 403, null)
        );
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json(
        generateResponse(false, 'Internal server error.', 500, null)
      );
    }
  };
};

// Middleware to check if user is admin (check for admin role or system administrator)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      generateResponse(false, 'Access denied. User not authenticated.', 401, null)
    );
  }

  // Check if user has admin privileges (admin role or system administrator)
  const adminRoles = ['admin', 'system_administrator', 'System Administrator'];
  console.log('User role:', req.user.user_role);
  console.log('Admin roles:', adminRoles);
  console.log('Has admin role:', adminRoles.includes(req.user.user_role));
  
  if (!adminRoles.includes(req.user.user_role)) {
    return res.status(403).json(
      generateResponse(false, 'Access denied. Admin privileges required.', 403, null)
    );
  }

  next();
};

// Middleware to check if user can read data validation module
const canReadValidation = checkPermission('data_validation', 'can_read');

// Middleware to check if user can create field instructions
const canCreateInstructions = checkPermission('field_instructions', 'can_create');

// Middleware to check if user can update field instructions
const canUpdateInstructions = checkPermission('field_instructions', 'can_update');

// Middleware to check if user can delete field instructions
const canDeleteInstructions = checkPermission('field_instructions', 'can_delete');

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  requireAdmin,
  canReadValidation,
  canCreateInstructions,
  canUpdateInstructions,
  canDeleteInstructions
};
