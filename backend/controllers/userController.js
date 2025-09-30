const userService = require('../services/userService');
const authService = require('../services/authService');
const { generateResponse } = require('../utils/genRes');

class UserController {
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const filters = req.query;
      const result = await userService.getAllUsers(filters);

      res.status(200).json(
        generateResponse(true, 'Users retrieved successfully', 200, result)
      );
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await userService.findUserById(userId);

      if (!user) {
        return res.status(404).json(
          generateResponse(false, 'User not found', 404, null)
        );
      }

      // Remove password from response
      delete user.user_password;

      res.status(200).json(
        generateResponse(true, 'User retrieved successfully', 200, user)
      );
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated through this endpoint
      delete updateData.user_password;
      delete updateData.user_id;
      delete updateData.created_at;

      const updatedUser = await userService.updateUser(userId, updateData);

      // Remove password from response
      delete updatedUser.user_password;

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

  // Delete user
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // Prevent admin from deleting themselves
      if (req.user && req.user.user_id === userId) {
        return res.status(400).json(
          generateResponse(false, 'Cannot delete your own account', 400, null)
        );
      }

      await userService.deleteUser(userId);

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

  // Get user permissions
  async getUserPermissions(req, res) {
    try {
      const { userId } = req.params;
      const permissions = await userService.getUserPermissions(userId);

      res.status(200).json(
        generateResponse(true, 'User permissions retrieved successfully', 200, permissions)
      );
    } catch (error) {
      console.error('Get user permissions error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Update user permissions
  async updateUserPermissions(req, res) {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;

      if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json(
          generateResponse(false, 'Permissions array is required', 400, null)
        );
      }

      await userService.updateUserPermissions(userId, permissions);

      res.status(200).json(
        generateResponse(true, 'User permissions updated successfully', 200, null)
      );
    } catch (error) {
      console.error('Update user permissions error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Get all roles
  async getRoles(req, res) {
    try {
      const roles = await userService.getRoles();

      res.status(200).json(
        generateResponse(true, 'Roles retrieved successfully', 200, roles)
      );
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Get all departments
  async getDepartments(req, res) {
    try {
      const departments = await userService.getDepartments();

      res.status(200).json(
        generateResponse(true, 'Departments retrieved successfully', 200, departments)
      );
    } catch (error) {
      console.error('Get departments error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Get all modules
  async getModules(req, res) {
    try {
      const modules = await userService.getModules();

      res.status(200).json(
        generateResponse(true, 'Modules retrieved successfully', 200, modules)
      );
    } catch (error) {
      console.error('Get modules error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Deactivate user
  async deactivateUser(req, res) {
    try {
      const { userId } = req.params;

      // Prevent admin from deactivating themselves
      if (req.user && req.user.user_id === userId) {
        return res.status(400).json(
          generateResponse(false, 'Cannot deactivate your own account', 400, null)
        );
      }

      await userService.updateUser(userId, { is_active: false });

      res.status(200).json(
        generateResponse(true, 'User deactivated successfully', 200, null)
      );
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Activate user
  async activateUser(req, res) {
    try {
      const { userId } = req.params;

      await userService.updateUser(userId, { is_active: true });

      res.status(200).json(
        generateResponse(true, 'User activated successfully', 200, null)
      );
    } catch (error) {
      console.error('Activate user error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }
}

module.exports = new UserController();
