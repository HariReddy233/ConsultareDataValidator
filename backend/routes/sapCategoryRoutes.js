const express = require('express');
const SAPCategoryController = require('../controllers/sapCategoryController');
const { checkDatabaseConnection } = require('../middleware/databaseCheck');

const router = express.Router();

// GET /api/categories - Get all categories with subcategories
router.get('/', checkDatabaseConnection, SAPCategoryController.getAllCategories);

// GET /api/categories/main - Get main categories only
router.get('/main', checkDatabaseConnection, SAPCategoryController.getMainCategories);

// GET /api/categories/:mainCategoryId/subcategories - Get subcategories by main category ID
router.get('/:mainCategoryId/subcategories', checkDatabaseConnection, SAPCategoryController.getSubcategoriesByMainCategoryId);

// GET /api/categories/name/:mainCategoryName/subcategories - Get subcategories by main category name
router.get('/name/:mainCategoryName/subcategories', checkDatabaseConnection, SAPCategoryController.getSubcategoriesByMainCategoryName);

// GET /api/categories/download/:subCategoryId/:fileType - Download template or sample file
router.get('/download/:subCategoryId/:fileType', checkDatabaseConnection, SAPCategoryController.downloadFile);

// POST /api/categories/main - Create new main category
router.post('/main', checkDatabaseConnection, SAPCategoryController.createMainCategory);

// POST /api/categories/subcategory - Create new subcategory
router.post('/subcategory', checkDatabaseConnection, SAPCategoryController.createSubcategory);

// PUT /api/categories/subcategory/:subCategoryId/paths - Update subcategory file paths
router.put('/subcategory/:subCategoryId/paths', checkDatabaseConnection, SAPCategoryController.updateSubcategoryPaths);

module.exports = router;
