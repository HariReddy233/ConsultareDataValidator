const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes (authentication required)
router.use(authenticate); // All routes below require authentication

// User profile routes
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);
router.get('/permissions', authController.getPermissions);
router.post('/logout', authController.logout);

// Admin routes (admin role required)
router.get('/users', requireAdmin, authController.getAllUsers);
router.put('/users/:userId', requireAdmin, authController.updateUser);
router.delete('/users/:userId', requireAdmin, authController.deleteUser);

module.exports = router;
