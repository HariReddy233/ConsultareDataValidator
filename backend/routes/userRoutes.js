const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Test endpoint (no authentication required)
router.get('/test-db', async (req, res) => {
  try {
    const userService = require('../services/userService');
    const result = await userService.testConnection();
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      data: result
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// All user routes require authentication
router.use(authenticate);

// User management routes (admin only)
router.get('/users', requireAdmin, userController.getAllUsers);
router.post('/users', requireAdmin, userController.createUser);
router.get('/users/:userId', requireAdmin, userController.getUserById);
router.put('/users/:userId', requireAdmin, userController.updateUser);
router.delete('/users/:userId', requireAdmin, userController.deleteUser);
router.put('/users/:userId/deactivate', requireAdmin, userController.deactivateUser);
router.put('/users/:userId/activate', requireAdmin, userController.activateUser);

// User permissions routes (admin only)
router.get('/users/:userId/permissions', requireAdmin, userController.getUserPermissions);
router.put('/users/:userId/permissions', requireAdmin, userController.updateUserPermissions);

// System data routes (admin only)
router.get('/roles', requireAdmin, userController.getRoles);
router.post('/roles', requireAdmin, userController.createRole);
router.put('/roles/:roleId', requireAdmin, userController.updateRole);
router.delete('/roles/:roleId', requireAdmin, userController.deleteRole);

router.get('/departments', requireAdmin, userController.getDepartments);
router.post('/departments', requireAdmin, userController.createDepartment);
router.put('/departments/:departmentId', requireAdmin, userController.updateDepartment);
router.delete('/departments/:departmentId', requireAdmin, userController.deleteDepartment);

router.get('/modules', requireAdmin, userController.getModules);

module.exports = router;
