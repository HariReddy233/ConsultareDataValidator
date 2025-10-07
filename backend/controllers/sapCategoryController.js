const SAPCategory = require('../models/SAPCategory');
const { handleDatabaseError } = require('../utils/errorHandler');
const fs = require('fs');
const path = require('path');
const { generateSampleData } = require('../utils/validation');
const Instruction = require('../models/Instruction');

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

      // Check if it's an API endpoint (starts with /api)
      if (filePath.startsWith('/api')) {
        // Handle API endpoint - generate a sample file
        const subcategoryName = await SAPCategory.getSubcategoryName(subCategoryId);
        const fileName = `${subcategoryName}_${fileType}.json`;
        
        // Generate sample data based on the subcategory
        const sampleData = await generateSampleDataForSubcategory(subcategoryName);
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        // Generate and send sample file
        await generateAndSendExcel(res, sampleData, subcategoryName);
        return;
      }
      
      // Check if it's a SharePoint URL that needs special handling
      if (filePath.startsWith('sharepoint://')) {
        // Handle SharePoint URLs - generate a sample file
        const fileName = filePath.split('/').pop();
        const subcategoryName = await SAPCategory.getSubcategoryName(subCategoryId);
        
        // Generate sample data based on the subcategory
        const sampleData = await generateSampleDataForSubcategory(subcategoryName);
        
        // Set headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        // Generate and send Excel file
        await generateAndSendExcel(res, sampleData, subcategoryName);
        return;
      }
      
      // Check if it's a regular URL (starts with http)
      if (filePath.startsWith('http')) {
        // Handle URL - redirect to the URL
        return res.redirect(filePath);
      } else {
        // Handle local file
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
      }
      
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

// Helper function to generate sample data for subcategory
async function generateSampleDataForSubcategory(subcategoryName) {
  try {
    // Get instructions for this subcategory
    const instructions = await Instruction.getByCategory(subcategoryName);
    
    if (!instructions || instructions.length === 0) {
      // Return basic sample data if no instructions found
      return [
        { 'Sample Field 1': 'Sample Value 1', 'Sample Field 2': 'Sample Value 2' },
        { 'Sample Field 1': 'Sample Value 3', 'Sample Field 2': 'Sample Value 4' }
      ];
    }
    
    // Generate sample data based on instructions
    const fields = instructions.map(row => {
      const field = {};
      Object.keys(row).forEach(key => {
        field[key] = row[key];
      });
      return field;
    });
    
    return generateSampleData(fields);
  } catch (error) {
    console.error('Error generating sample data:', error);
    return [
      { 'Sample Field 1': 'Sample Value 1', 'Sample Field 2': 'Sample Value 2' },
      { 'Sample Field 1': 'Sample Value 3', 'Sample Field 2': 'Sample Value 4' }
    ];
  }
}

// Helper function to generate and send Excel file
async function generateAndSendExcel(res, sampleData, subcategoryName) {
  try {
    // For now, we'll send JSON data as a simple response
    // In a real implementation, you would use a library like 'exceljs' to create actual Excel files
    
    const excelData = {
      subcategory: subcategoryName,
      data: sampleData,
      headers: sampleData.length > 0 ? Object.keys(sampleData[0]) : [],
      generatedAt: new Date().toISOString()
    };
    
    // Set headers for JSON response (temporary solution)
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${subcategoryName}_sample.json"`);
    
    res.json({
      success: true,
      message: 'Sample data generated successfully',
      data: excelData
    });
    
  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating sample file',
      error: error.message
    });
  }
}

module.exports = SAPCategoryController;
