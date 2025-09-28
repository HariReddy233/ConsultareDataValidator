# Dynamic SAP Categories Setup

This document explains how to set up and use the new dynamic SAP categories system that replaces static values with database-driven categories and subcategories.

## Overview

The system now includes:
- **Database Tables**: `SAP_MainCategories` and `SAP_SubCategories`
- **API Endpoints**: `/api/categories` for fetching categories and subcategories
- **File Downloads**: Dynamic template and sample file downloads based on database paths
- **React Frontend**: Dynamic sidebar and dropdown population

## Database Setup

### 1. Run the Migration

```bash
cd backend
node run-migration.js
```

This will create the required tables and insert sample data.

### 2. Database Schema

**SAP_MainCategories Table:**
- `MainCategoryID` (Primary Key)
- `MainCategoryName` (Unique)
- `CreatedAt`, `UpdatedAt` (Timestamps)

**SAP_SubCategories Table:**
- `SubCategoryID` (Primary Key)
- `MainCategoryID` (Foreign Key)
- `SubCategoryName`
- `TemplatePath` (File path for template downloads)
- `SamplePath` (File path for sample downloads)
- `CreatedAt`, `UpdatedAt` (Timestamps)

### 3. Sample Data

The migration includes sample data for:
- **Business Partner Master Data**: General Info, Address, Tax Info, Contact Person, State Code, Group Code
- **Item Master Data**: Item Details, Pricing, Inventory, Categories, Specifications
- **Financial Data**: Chart of Accounts, GL Accounts, Cost Centers, Profit Centers
- **Set Up Data**: Company Settings, User Management, System Configuration, Integration Settings

## API Endpoints

### Get All Categories with Subcategories
```
GET /api/categories
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "MainCategoryID": 1,
      "MainCategoryName": "Business Partner Master Data",
      "SubCategories": [
        {
          "SubCategoryID": 1,
          "SubCategoryName": "General Info",
          "TemplatePath": "D:\\Hari\\DTW Excel Templates&Sample Files\\Template files\\General Info.xlsx",
          "SamplePath": "D:\\Hari\\DTW Excel Templates&Sample Files\\Sample files\\General Info.xlsx"
        }
      ]
    }
  ]
}
```

### Download Template or Sample File
```
GET /api/categories/download/:subCategoryId/:fileType
```

Where `fileType` is either `template` or `sample`.

## Frontend Changes

### 1. Dynamic Sidebar
- Categories are now loaded from the database
- Icons are automatically assigned based on category names
- Loading states and error handling included

### 2. Dynamic Dropdown
- Subcategories are loaded based on selected main category
- Real-time updates when switching categories
- Loading indicators during data fetching

### 3. File Downloads
- Template and Sample buttons are disabled until a subcategory is selected
- Files are downloaded using paths stored in the database
- Proper error handling for missing files

## File Structure

### Backend Files Added/Modified:
- `backend/migrations/create_sap_categories_tables.sql` - Database migration
- `backend/models/SAPCategory.js` - Database model for categories
- `backend/controllers/sapCategoryController.js` - API controller
- `backend/routes/sapCategoryRoutes.js` - API routes
- `backend/run-migration.js` - Migration runner script
- `backend/index.js` - Updated to include new routes

### Frontend Files Added/Modified:
- `frontend/src/hooks/useSAPCategories.ts` - Custom hook for category management
- `frontend/src/types/index.ts` - Updated with new type definitions
- `frontend/src/services/api.ts` - Added category API methods
- `frontend/src/components/layout/Sidebar.tsx` - Dynamic sidebar
- `frontend/src/components/layout/MainContent.tsx` - Dynamic dropdown and downloads

## Usage Instructions

### 1. Start the Backend
```bash
cd backend
npm install
node run-migration.js  # Run this first time only
npm start
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Using the Application
1. The sidebar will automatically load categories from the database
2. Click on a main category to see its subcategories in the dropdown
3. Select a subcategory to enable the Template and Sample download buttons
4. Click Template or Sample to download the corresponding file

## Adding New Categories

### Via Database (Direct)
```sql
-- Add new main category
INSERT INTO "SAP_MainCategories" ("MainCategoryName") VALUES ('New Category');

-- Add subcategories
INSERT INTO "SAP_SubCategories" ("MainCategoryID", "SubCategoryName", "TemplatePath", "SamplePath") 
VALUES (1, 'New Subcategory', 'path/to/template.xlsx', 'path/to/sample.xlsx');
```

### Via API
```bash
# Add main category
curl -X POST http://localhost:3000/api/categories/main \
  -H "Content-Type: application/json" \
  -d '{"mainCategoryName": "New Category"}'

# Add subcategory
curl -X POST http://localhost:3000/api/categories/subcategory \
  -H "Content-Type: application/json" \
  -d '{"mainCategoryId": 1, "subCategoryName": "New Subcategory", "templatePath": "path/to/template.xlsx", "samplePath": "path/to/sample.xlsx"}'
```

## Troubleshooting

### Common Issues:

1. **Categories not loading**: Check database connection and ensure migration was run
2. **File downloads failing**: Verify file paths in database exist on the server
3. **Frontend errors**: Check browser console for API errors

### Database Connection Issues:
- Verify PostgreSQL is running
- Check connection parameters in `.env` file
- Ensure database exists and user has proper permissions

### File Path Issues:
- Ensure template and sample files exist at the specified paths
- Check file permissions for the Node.js process
- Use absolute paths for better reliability

## Benefits

1. **Dynamic**: No more hardcoded categories - everything is database-driven
2. **Scalable**: Easy to add new categories and subcategories
3. **Maintainable**: Centralized category management
4. **Flexible**: File paths can be updated without code changes
5. **User-friendly**: Intuitive interface with proper loading states and error handling
