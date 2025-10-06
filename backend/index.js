require('dotenv').config();
const { app, PORT } = require('./config/app');
const { pool } = require('./config/database');

// Import routes
const instructionRoutes = require('./routes/instructionRoutes');
const healthRoutes = require('./routes/healthRoutes');
const sapCategoryRoutes = require('./routes/sapCategoryRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dynamicDataRoutes = require('./routes/dynamicDataRoutes');
const excelRoutes = require('./routes/excelRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/excel', excelRoutes);
app.use('/', instructionRoutes);
app.use('/', healthRoutes);
app.use('/api/categories', sapCategoryRoutes);
app.use('/api/dynamic-data', dynamicDataRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`API endpoints:`);
  console.log(`Authentication:`);
  console.log(`  POST   /api/auth/register`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  POST   /api/auth/forgot-password`);
  console.log(`  POST   /api/auth/reset-password`);
  console.log(`  GET    /api/auth/profile`);
  console.log(`  PUT    /api/auth/profile`);
  console.log(`  PUT    /api/auth/change-password`);
  console.log(`  GET    /api/auth/permissions`);
  console.log(`  POST   /api/auth/logout`);
  console.log(`  GET    /api/auth/users (admin)`);
  console.log(`  PUT    /api/auth/users/:userId (admin)`);
  console.log(`  DELETE /api/auth/users/:userId (admin)`);
  console.log(`User Management:`);
  console.log(`  GET    /api/users/users (admin)`);
  console.log(`  GET    /api/users/users/:userId (admin)`);
  console.log(`  PUT    /api/users/users/:userId (admin)`);
  console.log(`  DELETE /api/users/users/:userId (admin)`);
  console.log(`  PUT    /api/users/users/:userId/deactivate (admin)`);
  console.log(`  PUT    /api/users/users/:userId/activate (admin)`);
  console.log(`  GET    /api/users/users/:userId/permissions (admin)`);
  console.log(`  PUT    /api/users/users/:userId/permissions (admin)`);
  console.log(`  GET    /api/users/roles (admin)`);
  console.log(`  GET    /api/users/departments (admin)`);
  console.log(`  GET    /api/users/modules (admin)`);
  console.log(`Data Validation:`);
  console.log(`  GET    /sap_bp_master_instructions`);
  console.log(`  GET    /sap_bp_master_instructions/:sapFieldName`);
  console.log(`  POST   /sap_bp_master_instructions`);
  console.log(`  PUT    /sap_bp_master_instructions/:sapFieldName`);
  console.log(`  DELETE /sap_bp_master_instructions/:sapFieldName`);
  console.log(`  GET    /instructions/:category`);
  console.log(`  GET    /instructions/subcategory/:subcategoryName`);
  console.log(`  GET    /instructions/dynamic/:subcategoryName`);
  console.log(`  POST   /validate/:category`);
  console.log(`  GET    /download-sample/:category`);
  console.log(`  GET    /debug/tables`);
  console.log(`  GET    /api/categories`);
  console.log(`  GET    /api/categories/main`);
  console.log(`  GET    /api/categories/:mainCategoryId/subcategories`);
  console.log(`  GET    /api/categories/download/:subCategoryId/:fileType`);
  console.log(`Excel Management:`);
  console.log(`  POST   /api/excel/upload-schema`);
  console.log(`  GET    /api/excel/schema/:category/:subcategory?`);
  console.log(`  GET    /api/excel/data/:category/:subcategory?`);
  console.log(`  DELETE /api/excel/table/:category/:subcategory?`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});
