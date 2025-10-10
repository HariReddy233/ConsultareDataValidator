const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ulid } = require('ulid');
const userService = require('./userService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m'; // 30 minutes

class AuthService {
  // Generate JWT token
  generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Verify JWT token
  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Register new user
  async register(userData) {
    try {
      const { user_name, user_email, user_password, user_role = 'user', user_department, user_phone_number } = userData;
      
      // Check if user already exists
      const existingUser = await userService.findUserByEmail(user_email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(user_password);

      // Create user object
      const newUser = {
        user_id: ulid(),
        user_name,
        user_email,
        user_password: hashedPassword,
        user_role,
        user_department,
        user_phone_number,
        is_active: true
      };

      // Add user to database
      const result = await userService.addUser(newUser);
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        // Remove password from response
        delete user.user_password;
        return user;
      }
      
      throw new Error('Failed to create user');
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login user
  async login(identifier, password) {
    try {
      console.log('Login attempt for identifier:', identifier);
      
      // Find user by email, username, or phone
      const user = await userService.findUserByMultiple(identifier);
      if (!user) {
        console.log('User not found for identifier:', identifier);
        throw new Error('Invalid credentials');
      }

      console.log('User found:', user.user_email, 'Active:', user.is_active);

      // Check if user is active
      if (!user.is_active) {
        console.log('User account is deactivated');
        throw new Error('Account is deactivated');
      }

      // Compare password
      console.log('Comparing password...');
      const isPasswordValid = await this.comparePassword(password, user.user_password);
      console.log('Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('Password comparison failed');
        throw new Error('Invalid credentials');
      }

      // Generate token immediately for faster login
      const tokenPayload = {
        user_id: user.user_id,
        user_email: user.user_email,
        user_role: user.user_role,
        user_department: user.user_department
      };

      const token = this.generateToken(tokenPayload);

      // Get role and department names for display
      let roleName = user.user_role;
      let departmentName = user.user_department;
      
      try {
        if (user.user_role) {
          const role = await userService.getRoleById(user.user_role);
          if (role) {
            roleName = role.role_name;
          }
        }
        
        if (user.user_department) {
          const department = await userService.getDepartmentById(user.user_department);
          if (department) {
            departmentName = department.department_name;
          }
        }
      } catch (error) {
        console.error('Error fetching role/department names:', error);
        // Continue with IDs if names can't be fetched
      }

      // Remove password from user object
      delete user.user_password;

      // Add role and department names to user object
      const userWithNames = {
        ...user,
        role_name: roleName,
        department_name: departmentName
      };

      // Return basic user data and token immediately
      // Permissions will be loaded separately after login
      return {
        user: userWithNames,
        token,
        permissions: [] // Empty initially, will be loaded by frontend
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Find user by email
  async findUserByEmail(email) {
    return await userService.findUserByEmail(email);
  }

  // Find user by ID
  async findUserById(userId) {
    return await userService.findUserById(userId);
  }

  // Get user permissions
  async getUserPermissions(userId) {
    return await userService.getUserPermissions(userId);
  }

  // Update user password
  async updatePassword(userId, oldPassword, newPassword) {
    try {
      // Get current user
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const isOldPasswordValid = await this.comparePassword(oldPassword, user.user_password);
      if (!isOldPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await userService.updateUser(userId, { user_password: hashedNewPassword });

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new Error(`Password update failed: ${error.message}`);
    }
  }

  // Reset password (for forgot password functionality)
  async resetPassword(email, newPassword) {
    try {
      const user = await this.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      const hashedPassword = await this.hashPassword(newPassword);
      await userService.updateUser(user.user_id, { user_password: hashedPassword });

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  // Get all users (for admin)
  async getAllUsers(filters = {}) {
    return await userService.getAllUsers(filters);
  }

  // Update user
  async updateUser(userId, updateData) {
    return await userService.updateUser(userId, updateData);
  }

  // Delete user
  async deleteUser(userId) {
    return await userService.deleteUser(userId);
  }
}

module.exports = new AuthService();
