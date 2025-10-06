const authService = require('../services/authService');
const userService = require('../services/userService');
const { generateResponse } = require('../utils/genRes');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { user_name, user_email, user_password, user_role, user_department, user_phone_number } = req.body;

      // Validate required fields
      if (!user_name || !user_email || !user_password) {
        return res.status(400).json(
          generateResponse(false, 'Name, email, and password are required', 400, null)
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user_email)) {
        return res.status(400).json(
          generateResponse(false, 'Please provide a valid email address', 400, null)
        );
      }

      // Validate password strength
      if (user_password.length < 6) {
        return res.status(400).json(
          generateResponse(false, 'Password must be at least 6 characters long', 400, null)
        );
      }

      const user = await authService.register({
        user_name,
        user_email,
        user_password,
        user_role: user_role || 'user',
        user_department,
        user_phone_number
      });

      res.status(201).json(
        generateResponse(true, 'User registered successfully', 201, user)
      );
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { user_email, user_password, identifier } = req.body;

      // Support both old and new field names for backward compatibility
      const loginIdentifier = user_email || identifier;

      // Validate required fields
      if (!loginIdentifier || !user_password) {
        return res.status(400).json(
          generateResponse(false, 'Username/Email and password are required', 400, null)
        );
      }

      const result = await authService.login(loginIdentifier, user_password);

      res.status(200).json(
        generateResponse(true, 'Login successful', 200, result)
      );
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json(
        generateResponse(false, error.message, 401, null)
      );
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.user_id;
      const user = await authService.findUserById(userId);
      
      if (!user) {
        return res.status(404).json(
          generateResponse(false, 'User not found', 404, null)
        );
      }

      // Remove password from response
      delete user.user_password;

      res.status(200).json(
        generateResponse(true, 'Profile retrieved successfully', 200, user)
      );
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.user_id;
      const updateData = req.body;

      // Remove fields that shouldn't be updated through profile
      delete updateData.user_password;
      delete updateData.user_id;
      delete updateData.created_at;

      const updatedUser = await authService.updateUser(userId, updateData);

      res.status(200).json(
        generateResponse(true, 'Profile updated successfully', 200, updatedUser)
      );
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const userId = req.user.user_id;
      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        return res.status(400).json(
          generateResponse(false, 'Current password and new password are required', 400, null)
        );
      }

      if (new_password.length < 6) {
        return res.status(400).json(
          generateResponse(false, 'New password must be at least 6 characters long', 400, null)
        );
      }

      await authService.updatePassword(userId, current_password, new_password);

      res.status(200).json(
        generateResponse(true, 'Password changed successfully', 200, null)
      );
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Get user permissions
  async getPermissions(req, res) {
    try {
      const userId = req.user.user_id;
      const permissions = await authService.getUserPermissions(userId);

      res.status(200).json(
        generateResponse(true, 'Permissions retrieved successfully', 200, permissions)
      );
    } catch (error) {
      console.error('Get permissions error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Logout (client-side token removal)
  async logout(req, res) {
    try {
      res.status(200).json(
        generateResponse(true, 'Logout successful', 200, null)
      );
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Admin: Get all users
  async getAllUsers(req, res) {
    try {
      const filters = req.query;
      const users = await authService.getAllUsers(filters);

      res.status(200).json(
        generateResponse(true, 'Users retrieved successfully', 200, users)
      );
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Admin: Update user
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      const updatedUser = await authService.updateUser(userId, updateData);

      res.status(200).json(
        generateResponse(true, 'User updated successfully', 200, updatedUser)
      );
    } catch (error) {
      console.error('Update user error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Admin: Delete user
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      await authService.deleteUser(userId);

      res.status(200).json(
        generateResponse(true, 'User deleted successfully', 200, null)
      );
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { user_email } = req.body;

      if (!user_email) {
        return res.status(400).json(
          generateResponse(false, 'Email is required', 400, null)
        );
      }

      // For now, just return success (in production, you'd send an email)
      res.status(200).json(
        generateResponse(true, 'Password reset instructions sent to your email', 200, null)
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { user_email, new_password } = req.body;

      if (!user_email || !new_password) {
        return res.status(400).json(
          generateResponse(false, 'Email and new password are required', 400, null)
        );
      }

      if (new_password.length < 6) {
        return res.status(400).json(
          generateResponse(false, 'New password must be at least 6 characters long', 400, null)
        );
      }

      await authService.resetPassword(user_email, new_password);

      res.status(200).json(
        generateResponse(true, 'Password reset successfully', 200, null)
      );
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }
}

module.exports = new AuthController();
