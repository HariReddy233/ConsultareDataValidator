const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || '66.175.209.51',
  database: process.env.DB_NAME || 'sapb1validator',
  password: process.env.DB_PASSWORD || 'Consultare@#890',
  port: process.env.DB_PORT || 5432
});

async function testUserService() {
  try {
    // Simulate the userService.getAllUsers method
    const filters = { role: 'admin' };
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

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM users WHERE 1=1 ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get users with role and department names
    paramCount++;
    const usersQuery = `
      SELECT u.user_id, u.user_name, u.user_email, u.user_role, u.user_department, 
             u.user_phone_number, u.is_active, u.created_at, u.last_login,
             r.role_name, d.department_name
      FROM users u
      LEFT JOIN roles r ON u.user_role = r.role_id
      LEFT JOIN departments d ON u.user_department = d.department_id
      WHERE 1=1 ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    queryParams.push(limit, offset);
    
    const usersResult = await pool.query(usersQuery, queryParams);

    const result = {
      users: usersResult.rows,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };

    console.log('=== Backend Service Result ===');
    console.log('Result structure:', JSON.stringify(result, null, 2));
    
    console.log('\n=== Users Array ===');
    console.table(result.users);

    // Simulate the API response
    const apiResponse = {
      success: true,
      message: 'Users retrieved successfully',
      statusCode: 200,
      data: result,
      timestamp: new Date().toISOString()
    };

    console.log('\n=== API Response Structure ===');
    console.log('API Response:', JSON.stringify(apiResponse, null, 2));

    console.log('\n=== Frontend Access Pattern ===');
    console.log('response.data.users:', apiResponse.data.users);
    console.log('response.data.users length:', apiResponse.data.users.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testUserService();





