const { withClient } = require('../utils/database');
const { ulid } = require('ulid');

class UserService {
  // Find user by email
  async findUserByEmail(email) {
    return withClient(async (client) => {
      try {
        const query = 'SELECT * FROM users WHERE user_email = $1';
        const result = await client.query(query, [email]);
        return result.rows.length > 0 ? result.rows[0] : null;
      } catch (error) {
        console.error('Database error in findUserByEmail:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }

  // Find user by multiple criteria (email, username, or phone) - optimized
  async findUserByMultiple(identifier) {
    return withClient(async (client) => {
      try {
        // Check email first (most common login method)
        let query = `SELECT * FROM users WHERE user_email = $1 LIMIT 1`;
        let result = await client.query(query, [identifier]);
        
        if (result.rows.length > 0) {
          return result.rows[0];
        }
        
        // If not found by email, check username
        query = `SELECT * FROM users WHERE user_name = $1 LIMIT 1`;
        result = await client.query(query, [identifier]);
        
        if (result.rows.length > 0) {
          return result.rows[0];
        }
        
        // If still not found, check phone (least common)
        query = `SELECT * FROM users WHERE user_phone_number = $1 LIMIT 1`;
        result = await client.query(query, [identifier]);
        
        return result.rows.length > 0 ? result.rows[0] : null;
      } catch (error) {
        console.error('Database error in findUserByMultiple:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }

  // Find user by ID
  async findUserById(userId) {
    return withClient(async (client) => {
      try {
        const query = 'SELECT * FROM users WHERE user_id = $1';
        const result = await client.query(query, [userId]);
        return result.rows.length > 0 ? result.rows[0] : null;
      } catch (error) {
        console.error('Database error in findUserById:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }

  // Add new user
  async addUser(userData) {
    return withClient(async (client) => {
      try {
        const columns = Object.keys(userData);
        const values = Object.values(userData);

        const insertQuery = `INSERT INTO users (${columns.join(', ')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`;
        
        const result = await client.query(insertQuery, values);
        
        if (result.rows.length > 0) {
          // Create default permissions for the user
          await this.createDefaultPermissions(client, userData.user_id);
        }
        
        return result;
      } catch (error) {
        console.error('Database error in addUser:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }

  // Create default permissions for new user
  async createDefaultPermissions(client, userId) {
    try {
      // Get all active modules
      const modulesQuery = 'SELECT * FROM modules WHERE is_active = true';
      const modulesResult = await client.query(modulesQuery);
      
      if (modulesResult.rows.length > 0) {
        for (const module of modulesResult.rows) {
          const permissionData = {
            permission_id: ulid(),
            user_id: userId,
            module_id: module.module_id,
            can_read: true, // Default read permission
            can_create: false,
            can_update: false,
            can_delete: false,
            can_export: false,
            can_print: false
          };

          const columns = Object.keys(permissionData);
          const values = Object.values(permissionData);
          const insertQuery = `INSERT INTO user_permissions (${columns.join(', ')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`;
          
          await client.query(insertQuery, values);
        }
      }
    } catch (error) {
      console.error('Error creating default permissions:', error);
      // Don't throw error here as user creation should still succeed
    }
  }

  // Update user
  async updateUser(userId, updateData) {
    return withClient(async (client) => {
      try {
        const allowedFields = ['user_name', 'user_email', 'user_role', 'user_department', 'user_phone_number', 'is_active'];
        const updateFields = Object.keys(updateData).filter(key => allowedFields.includes(key));
        
        if (updateFields.length === 0) {
          throw new Error('No valid fields to update');
        }

        const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const values = updateFields.map(field => updateData[field]);
        values.push(userId);

        const query = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $${values.length} RETURNING *`;
        
        const result = await client.query(query, values);
        
        if (result.rows.length === 0) {
          throw new Error('User not found');
        }
        
        return result;
      } catch (error) {
        console.error('Database error in updateUser:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }

  // Delete user
  async deleteUser(userId) {
    return withClient(async (client) => {
      try {
        const query = 'DELETE FROM users WHERE user_id = $1';
        const result = await client.query(query, [userId]);
        
        if (result.rowCount === 0) {
          throw new Error('User not found');
        }
        
        return { message: 'User deleted successfully' };
      } catch (error) {
        console.error('Database error in deleteUser:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }

  // Get all users with pagination and filters
  async getAllUsers(filters = {}) {
    return withClient(async (client) => {
      try {
        const { page = 1, limit = 10, role, department, search } = filters;
        const offset = (page - 1) * limit;

        let whereClause = '';
        const queryParams = [];
        let paramCount = 0;

        if (role) {
          paramCount++;
          whereClause += ` AND user_role = $${paramCount}`;
          queryParams.push(role);
        }

        if (department) {
          paramCount++;
          whereClause += ` AND user_department = $${paramCount}`;
          queryParams.push(department);
        }

        if (search) {
          paramCount++;
          whereClause += ` AND (user_name ILIKE $${paramCount} OR user_email ILIKE $${paramCount})`;
          queryParams.push(`%${search}%`);
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM users WHERE 1=1 ${whereClause}`;
        const countResult = await client.query(countQuery, queryParams);
        const totalCount = parseInt(countResult.rows[0].count);

        // Get users
        paramCount++;
        const usersQuery = `
          SELECT user_id, user_name, user_email, user_role, user_department, 
                 user_phone_number, is_active, created_at, last_login
          FROM users 
          WHERE 1=1 ${whereClause}
          ORDER BY created_at DESC
          LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        queryParams.push(limit, offset);
        
        const usersResult = await client.query(usersQuery, queryParams);

        return {
          users: usersResult.rows,
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        };
      } catch (error) {
        console.error('Database error in getAllUsers:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }

  // Get user permissions
  async getUserPermissions(userId) {
    return withClient(async (client) => {
      try {
        const query = `
          SELECT 
            m.module_name,
            m.module_path,
            up.can_read,
            up.can_create,
            up.can_update,
            up.can_delete,
            up.can_export,
            up.can_print
          FROM user_permissions up
          JOIN modules m ON up.module_id = m.module_id
          WHERE up.user_id = $1 AND m.is_active = true
        `;
        const result = await client.query(query, [userId]);
        return result.rows;
      } catch (error) {
        console.error('Database error in getUserPermissions:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }

  // Update user permissions
  async updateUserPermissions(userId, permissions) {
    return withClient(async (client) => {
      try {
        await client.query('BEGIN');

        // Delete existing permissions
        await client.query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);

        // Insert new permissions
        for (const permission of permissions) {
          const permissionData = {
            permission_id: ulid(),
            user_id: userId,
            module_id: permission.module_id,
            can_read: permission.can_read || false,
            can_create: permission.can_create || false,
            can_update: permission.can_update || false,
            can_delete: permission.can_delete || false,
            can_export: permission.can_export || false,
            can_print: permission.can_print || false
          };

          const columns = Object.keys(permissionData);
          const values = Object.values(permissionData);
          const insertQuery = `INSERT INTO user_permissions (${columns.join(', ')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')})`;
          
          await client.query(insertQuery, values);
        }

        await client.query('COMMIT');
        return { message: 'Permissions updated successfully' };
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error in updateUserPermissions:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }

  // Get all roles
  async getRoles() {
    return withClient(async (client) => {
      try {
        const query = 'SELECT * FROM roles ORDER BY role_name';
        const result = await client.query(query);
        return result.rows;
      } catch (error) {
        console.error('Database error in getRoles:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }

  // Get all departments
  async getDepartments() {
    return withClient(async (client) => {
      try {
        const query = 'SELECT * FROM departments ORDER BY department_name';
        const result = await client.query(query);
        return result.rows;
      } catch (error) {
        console.error('Database error in getDepartments:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }

  // Get all modules
  async getModules() {
    return withClient(async (client) => {
      try {
        const query = 'SELECT * FROM modules WHERE is_active = true ORDER BY module_name';
        const result = await client.query(query);
        return result.rows;
      } catch (error) {
        console.error('Database error in getModules:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    });
  }
}

module.exports = new UserService();
