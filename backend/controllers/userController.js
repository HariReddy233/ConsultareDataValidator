const userService = require('../services/userService');
const authService = require('../services/authService');
const { generateResponse } = require('../utils/genRes');

class UserController {
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const filters = req.query;
      console.log('Getting all users with filters:', filters);
      
      const result = await userService.getAllUsers(filters);
      
      console.log('Users retrieved:', result.users.length, 'out of', result.totalCount);

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

  // Create new user
  async createUser(req, res) {
    try {
      const userData = req.body;
      
      // Debug: Log the received data
      console.log('Received user data:', JSON.stringify(userData, null, 2));
      
      // Validate required fields
      const requiredFields = ['user_name', 'user_email', 'user_password', 'user_role', 'user_department'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        console.log('Missing fields:', missingFields);
        return res.status(400).json(
          generateResponse(false, `Missing required fields: ${missingFields.join(', ')}`, 400, null)
        );
      }

      // Validate that role and department exist
      const roleExists = await userService.getRoleById(userData.user_role);
      if (!roleExists) {
        return res.status(400).json(
          generateResponse(false, 'Invalid role ID', 400, null)
        );
      }

      const departmentExists = await userService.getDepartmentById(userData.user_department);
      if (!departmentExists) {
        return res.status(400).json(
          generateResponse(false, 'Invalid department ID', 400, null)
        );
      }

      // Hash password before storing
      const authService = require('../services/authService');
      const hashedPassword = await authService.hashPassword(userData.user_password);
      userData.user_password = hashedPassword;

      // Generate user ID
      const { ulid } = require('ulid');
      userData.user_id = ulid();

      console.log('About to create user with data:', {
        user_id: userData.user_id,
        user_name: userData.user_name,
        user_email: userData.user_email,
        user_role: userData.user_role,
        user_department: userData.user_department,
        has_password: !!userData.user_password
      });

      const result = await userService.addUser(userData);
      
      console.log('User created successfully:', result.rows[0].user_id);
      
      // Remove password from response
      delete result.rows[0].user_password;

      res.status(201).json(
        generateResponse(true, 'User created successfully', 201, result.rows[0])
      );
    } catch (error) {
      console.error('Create user error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
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

  // Create new role
  async createRole(req, res) {
    try {
      const { role_name, role_description } = req.body;
      
      if (!role_name) {
        return res.status(400).json(
          generateResponse(false, 'Role name is required', 400, null)
        );
      }

      const result = await userService.createRole({ role_name, role_description });

      res.status(201).json(
        generateResponse(true, 'Role created successfully', 201, result)
      );
    } catch (error) {
      console.error('Create role error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Update role
  async updateRole(req, res) {
    try {
      const { roleId } = req.params;
      const { role_name, role_description } = req.body;

      const result = await userService.updateRole(roleId, { role_name, role_description });

      res.status(200).json(
        generateResponse(true, 'Role updated successfully', 200, result)
      );
    } catch (error) {
      console.error('Update role error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Delete role
  async deleteRole(req, res) {
    try {
      const { roleId } = req.params;

      await userService.deleteRole(roleId);

      res.status(200).json(
        generateResponse(true, 'Role deleted successfully', 200, null)
      );
    } catch (error) {
      console.error('Delete role error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Create new department
  async createDepartment(req, res) {
    try {
      const { department_name, department_description } = req.body;
      
      if (!department_name) {
        return res.status(400).json(
          generateResponse(false, 'Department name is required', 400, null)
        );
      }

      const result = await userService.createDepartment({ department_name, department_description });

      res.status(201).json(
        generateResponse(true, 'Department created successfully', 201, result)
      );
    } catch (error) {
      console.error('Create department error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Update department
  async updateDepartment(req, res) {
    try {
      const { departmentId } = req.params;
      const { department_name, department_description } = req.body;

      const result = await userService.updateDepartment(departmentId, { department_name, department_description });

      res.status(200).json(
        generateResponse(true, 'Department updated successfully', 200, result)
      );
    } catch (error) {
      console.error('Update department error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Delete department
  async deleteDepartment(req, res) {
    try {
      const { departmentId } = req.params;

      await userService.deleteDepartment(departmentId);

      res.status(200).json(
        generateResponse(true, 'Department deleted successfully', 200, null)
      );
    } catch (error) {
      console.error('Delete department error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }
}

module.exports = new UserController();
