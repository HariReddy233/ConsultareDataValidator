-- Fix SubCategoryName inconsistencies in SAP_SubCategories table
-- This script corrects the naming inconsistencies where some entries are missing spaces

-- Update GeneralInfo to General Info
UPDATE "SAP_SubCategories" 
SET "SubCategoryName" = 'General Info' 
WHERE "SubCategoryName" = 'GeneralInfo';

-- Update any other potential inconsistencies
-- (Add more UPDATE statements here if you find other inconsistencies)

-- Verify the changes
SELECT "SubCategoryID", "SubCategoryName", "Data_Table" 
FROM "SAP_SubCategories" 
ORDER BY "SubCategoryID";
