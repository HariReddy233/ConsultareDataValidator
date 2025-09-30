const express = require('express');
const router = express.Router();
const DynamicDataController = require('../controllers/dynamicDataController');
const { authenticate } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes (temporarily disabled for testing)
// router.use(authenticate);

// GET /api/dynamic-data/:category - Get data from any table based on category
router.get('/:category', DynamicDataController.getDataByCategory);

// GET /api/dynamic-data/:category/columns - Get column information for a category
router.get('/:category/columns', DynamicDataController.getColumnInfo);

// GET /api/dynamic-data/table/:tableName - Get data from any table by table name (with variables)
router.get('/table/:tableName', DynamicDataController.getDataByTableName);

// POST /api/dynamic-data/:category - Insert data into the table
router.post('/:category', DynamicDataController.insertData);

// PUT /api/dynamic-data/:category/:id - Update data in the table
router.put('/:category/:id', DynamicDataController.updateData);

// DELETE /api/dynamic-data/:category/:id - Delete data from the table
router.delete('/:category/:id', DynamicDataController.deleteData);

module.exports = router;
