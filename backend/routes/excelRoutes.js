const express = require('express');
const { upload, controller } = require('../controllers/excelController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes (temporarily disabled for testing)
// router.use(authenticate);

// Upload Excel schema
router.post('/upload-schema', upload.single('file'), controller.uploadSchema);

// Get table schema
router.get('/schema/:category/:subcategory?', controller.getTableSchema);

// Get table data
router.get('/data/:category/:subcategory?', controller.getTableData);

// Delete table
router.delete('/table/:category/:subcategory?', controller.deleteTable);

module.exports = router;
