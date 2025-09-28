const SAPCategory = require('../models/SAPCategory');
const { handleDatabaseError } = require('../utils/errorHandler');
const fs = require('fs');
const path = require('path');

class SAPCategoryController {
  // GET /api/categories - Get all categories with subcategories
  static async getAllCategories(req, res) {
    try {
      const categories = await SAPCategory.getAllCategoriesWithSubcategories();
      
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (err) {
      handleDatabaseError(err, res);
    }
  }

  // GET /api/categories/main - Get main categories only
  static async getMainCategories(req, res) {
    try {
      const mainCategories = await SAPCategory.getMainCategories();
      
      res.status(200).json({
        success: true,
        data: mainCategories
      });
    } catch (err) {
      handleDatabaseError(err, res);
    }
  }

  // GET /api/categories/:mainCategoryId/subcategories - Get subcategories by main category ID
  static async getSubcategoriesByMainCategoryId(req, res) {
    try {
      const { mainCategoryId } = req.params;
      const subcategories = await SAPCategory.getSubcategoriesByMainCategoryId(mainCategoryId);
      
      res.status(200).json({
        success: true,
        data: subcategories
      });
    } catch (err) {
      handleDatabaseError(err, res);
    }
  }

  // GET /api/categories/name/:mainCategoryName/subcategories - Get subcategories by main category name
  static async getSubcategoriesByMainCategoryName(req, res) {
    try {
      const { mainCategoryName } = req.params;
      const subcategories = await SAPCategory.getSubcategoriesByMainCategoryName(mainCategoryName);
      
      res.status(200).json({
        success: true,
        data: subcategories
      });
    } catch (err) {
      handleDatabaseError(err, res);
    }
  }

  // GET /api/categories/download/:subCategoryId/:fileType - Download template or sample file
  static async downloadFile(req, res) {
    try {
      const { subCategoryId, fileType } = req.params;
      
      // Validate file type
      if (!['template', 'sample'].includes(fileType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Must be "template" or "sample"'
        });
      }

      // Get file path from database
      const filePath = await SAPCategory.getFilePath(subCategoryId, fileType);
      
      if (!filePath) {
        return res.status(404).json({
          success: false,
          message: 'File path not found for the specified subcategory'
        });
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server',
          filePath: filePath
        });
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', stats.size);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
    } catch (err) {
      console.error('Error downloading file:', err);
      handleDatabaseError(err, res);
    }
  }

  // POST /api/categories/main - Create new main category
  static async createMainCategory(req, res) {
    try {
      const { mainCategoryName } = req.body;
      
      if (!mainCategoryName) {
        return res.status(400).json({
          success: false,
          message: 'Main category name is required'
        });
      }

      const mainCategory = await SAPCategory.createMainCategory(mainCategoryName);
      
      res.status(201).json({
        success: true,
        message: 'Main category created successfully',
        data: mainCategory
      });
    } catch (err) {
      if (err.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          success: false,
          message: 'Main category with this name already exists'
        });
      }
      handleDatabaseError(err, res);
    }
  }

  // POST /api/categories/subcategory - Create new subcategory
  static async createSubcategory(req, res) {
    try {
      const { mainCategoryId, subCategoryName, templatePath, samplePath } = req.body;
      
      if (!mainCategoryId) {
        return res.status(400).json({
          success: false,
          message: 'Main category ID is required'
        });
      }

      if (!subCategoryName) {
        return res.status(400).json({
          success: false,
          message: 'Sub category name is required'
        });
      }

      const subcategory = await SAPCategory.createSubcategory(
        mainCategoryId, 
        subCategoryName, 
        templatePath, 
        samplePath
      );
      
      res.status(201).json({
        success: true,
        message: 'Subcategory created successfully',
        data: subcategory
      });
    } catch (err) {
      if (err.code === '23503') { // Foreign key constraint violation
        return res.status(400).json({
          success: false,
          message: 'Invalid main category ID'
        });
      }
      handleDatabaseError(err, res);
    }
  }

  // PUT /api/categories/subcategory/:subCategoryId/paths - Update subcategory file paths
  static async updateSubcategoryPaths(req, res) {
    try {
      const { subCategoryId } = req.params;
      const { templatePath, samplePath } = req.body;
      
      const subcategory = await SAPCategory.updateSubcategoryPaths(
        subCategoryId, 
        templatePath, 
        samplePath
      );
      
      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message: 'Subcategory not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Subcategory paths updated successfully',
        data: subcategory
      });
    } catch (err) {
      handleDatabaseError(err, res);
    }
  }
}

module.exports = SAPCategoryController;
