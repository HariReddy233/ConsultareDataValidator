require('dotenv').config();
const { app, PORT } = require('./config/app');
const { pool } = require('./config/database');

// Import routes
const instructionRoutes = require('./routes/instructionRoutes');
const healthRoutes = require('./routes/healthRoutes');
const sapCategoryRoutes = require('./routes/sapCategoryRoutes');

// Use routes
app.use('/', instructionRoutes);
app.use('/', healthRoutes);
app.use('/api/categories', sapCategoryRoutes);

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
  console.log(`  GET    /sap_bp_master_instructions`);
  console.log(`  GET    /sap_bp_master_instructions/:sapFieldName`);
  console.log(`  POST   /sap_bp_master_instructions`);
  console.log(`  PUT    /sap_bp_master_instructions/:sapFieldName`);
  console.log(`  DELETE /sap_bp_master_instructions/:sapFieldName`);
  console.log(`  GET    /instructions/:category`);
  console.log(`  POST   /validate/:category`);
  console.log(`  GET    /download-sample/:category`);
  console.log(`  GET    /debug/tables`);
  console.log(`  GET    /api/categories`);
  console.log(`  GET    /api/categories/main`);
  console.log(`  GET    /api/categories/:mainCategoryId/subcategories`);
  console.log(`  GET    /api/categories/download/:subCategoryId/:fileType`);
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
