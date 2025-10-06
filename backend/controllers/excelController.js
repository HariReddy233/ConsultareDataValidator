const excelService = require('../services/excelService');
const { generateResponse } = require('../utils/genRes');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.endsWith('.xlsx') || 
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
    }
  }
});

class ExcelController {
  // Upload Excel schema and create/update database table
  async uploadSchema(req, res) {
    try {
      console.log('Excel upload request received');
      console.log('Request body:', req.body);
      console.log('Request file:', req.file);
      console.log('Request files:', req.files);
      
      const { category, subcategory } = req.body;
      const file = req.file;

      if (!file) {
        console.log('No file uploaded');
        return res.status(400).json(
          generateResponse(false, 'No file uploaded', 400, null)
        );
      }

      if (!category) {
        console.log('No category provided');
        return res.status(400).json(
          generateResponse(false, 'Category is required', 400, null)
        );
      }

      console.log(`Processing Excel file: ${file.originalname}, category: ${category}, subcategory: ${subcategory}`);
      const result = await excelService.processExcelSchema(file, category, subcategory);

      res.status(200).json(
        generateResponse(true, 'Excel schema processed successfully', 200, result)
      );
    } catch (error) {
      console.error('Excel upload error:', error);
      res.status(400).json(
        generateResponse(false, error.message, 400, null)
      );
    }
  }

  // Get table schema for a category
  async getTableSchema(req, res) {
    try {
      const { category, subcategory } = req.params;

      const schema = await excelService.getTableSchema(category, subcategory);

      res.status(200).json(
        generateResponse(true, 'Table schema retrieved successfully', 200, schema)
      );
    } catch (error) {
      console.error('Get table schema error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Get table data for a category
  async getTableData(req, res) {
    try {
      const { category, subcategory } = req.params;
      const { page = 1, limit = 100 } = req.query;

      const data = await excelService.getTableData(category, subcategory, parseInt(page), parseInt(limit));

      res.status(200).json(
        generateResponse(true, 'Table data retrieved successfully', 200, data)
      );
    } catch (error) {
      console.error('Get table data error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }

  // Delete table for a category
  async deleteTable(req, res) {
    try {
      const { category, subcategory } = req.params;

      await excelService.deleteTable(category, subcategory);

      res.status(200).json(
        generateResponse(true, 'Table deleted successfully', 200, null)
      );
    } catch (error) {
      console.error('Delete table error:', error);
      res.status(500).json(
        generateResponse(false, error.message, 500, null)
      );
    }
  }
}

// Export the upload middleware and controller
module.exports = {
  upload,
  controller: new ExcelController()
};

