const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// User management routes (admin only)
router.get('/users', requireAdmin, userController.getAllUsers);
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
router.get('/departments', requireAdmin, userController.getDepartments);
router.get('/modules', requireAdmin, userController.getModules);

module.exports = router;
